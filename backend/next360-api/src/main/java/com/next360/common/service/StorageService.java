package com.next360.common.service;

import com.next360.common.entity.UploadEntity;
import com.next360.common.enums.UserRole;
import com.next360.common.repository.UploadRepository;
import com.next360.common.security.SecurityUtils;
import com.next360.config.S3Properties;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

/**
 * S3-backed file storage for product images, KYC documents, certificates and avatars.
 *
 * <p>Two upload paths are supported:
 * <ul>
 *   <li><b>Proxied</b> — the file streams through the API ({@link #upload}). Simple, but
 *       every byte crosses the API.</li>
 *   <li><b>Presigned</b> — the API hands back a short-lived PUT URL and the client uploads
 *       straight to S3 ({@link #createUploadTicket}). Preferred for large files.</li>
 * </ul>
 *
 * <p>Object keys are namespaced per user ({@code folder/userId/uuid.ext}) and every object
 * is recorded in the {@code uploads} table, so deletes and private reads can be
 * ownership-checked instead of trusting a URL from the client.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    /** folder → allowed content types. */
    private static final Map<String, Set<String>> ALLOWED_TYPES = Map.of(
            "products", Set.of("image/jpeg", "image/jpg", "image/png", "image/webp"),
            "avatars", Set.of("image/jpeg", "image/jpg", "image/png", "image/webp"),
            "misc", Set.of("image/jpeg", "image/jpg", "image/png", "image/webp"),
            "kyc", Set.of("application/pdf", "image/jpeg", "image/jpg", "image/png"),
            "certificates", Set.of("application/pdf", "image/jpeg", "image/jpg", "image/png")
    );

    private static final Map<String, String> EXTENSION_BY_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/jpg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "application/pdf", ".pdf"
    );

    /** Folders only sellers and admins may write to. */
    private static final Set<String> SELLER_ONLY_FOLDERS = Set.of("kyc", "certificates");

    private static final Set<UserRole> ADMIN_ROLES = Set.of(
            UserRole.SUPER_ADMIN, UserRole.VERIFICATION_ADMIN,
            UserRole.OPERATIONS_ADMIN, UserRole.SUPPORT_ADMIN
    );

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Properties props;
    private final UploadRepository uploadRepository;

    public StorageService(S3Client s3Client,
                          S3Presigner s3Presigner,
                          S3Properties props,
                          UploadRepository uploadRepository) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.props = props;
        this.uploadRepository = uploadRepository;
    }

    /**
     * Fail fast at boot if the bucket is missing or the credentials cannot reach it —
     * far easier to diagnose here than on the first user upload.
     */
    @PostConstruct
    void verifyBucketAccess() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(props.getBucket()).build());
            log.info("S3 bucket '{}' is reachable", props.getBucket());
        } catch (NoSuchBucketException e) {
            log.error("S3 bucket '{}' does not exist — uploads will fail until it is created",
                    props.getBucket());
        } catch (Exception e) {
            log.warn("Could not verify S3 bucket '{}': {} — uploads may fail",
                    props.getBucket(), e.getMessage());
        }
    }

    /** What the caller needs to upload directly to S3 and then register the result. */
    public record UploadTicket(String uploadUrl, String objectKey, String publicUrl,
                               String contentType, int expiresInSeconds, long maxSizeBytes) {}

    /** A stored object as exposed to clients. */
    public record StoredFile(String key, String url, String contentType, long size, boolean isPublic) {}

    // ==================== Proxied upload ====================

    /**
     * Upload a file through the API to S3.
     *
     * @param file   the multipart file
     * @param folder key prefix — one of products, avatars, misc, kyc, certificates
     * @return the stored object, with a public URL for public folders or a presigned
     *         URL for private ones
     */
    @Transactional
    public StoredFile upload(MultipartFile file, String folder) {
        UUID userId = SecurityUtils.getCurrentUserId();
        validateFolderAccess(folder);
        String contentType = validateFile(file, folder);

        String key = buildKey(folder, userId, contentType, file.getOriginalFilename());
        boolean isPublic = !props.isPrivateFolder(folder);

        try {
            PutObjectRequest.Builder request = PutObjectRequest.builder()
                    .bucket(props.getBucket())
                    .key(key)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .serverSideEncryption(ServerSideEncryption.AES256)
                    .cacheControl(isPublic ? "public, max-age=31536000, immutable" : "private, no-store");

            s3Client.putObject(request.build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read the uploaded file", e);
        } catch (S3Exception e) {
            log.error("S3 upload failed for key {}: {}", key, e.getMessage());
            throw new IllegalStateException("Upload failed. Please try again.");
        }

        record(userId, key, folder, contentType, file.getSize(), isPublic);
        log.info("Uploaded {} ({} bytes) for user {}", key, file.getSize(), userId);

        return new StoredFile(key, urlFor(key, isPublic), contentType, file.getSize(), isPublic);
    }

    // ==================== Presigned upload ====================

    /**
     * Issue a short-lived presigned PUT URL so the client can upload straight to S3.
     * The object is registered up front; {@link #confirmUpload} verifies it actually landed.
     */
    @Transactional
    public UploadTicket createUploadTicket(String folder, String contentType, Long sizeBytes) {
        UUID userId = SecurityUtils.getCurrentUserId();
        validateFolderAccess(folder);
        validateContentType(contentType, folder);

        if (sizeBytes != null && sizeBytes > props.getMaxFileSizeBytes()) {
            throw new IllegalArgumentException("File exceeds the "
                    + (props.getMaxFileSizeBytes() / (1024 * 1024)) + "MB limit");
        }

        String key = buildKey(folder, userId, contentType, null);
        boolean isPublic = !props.isPrivateFolder(folder);

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .contentType(contentType)
                .serverSideEncryption(ServerSideEncryption.AES256)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(props.getPresignUploadTtlSeconds()))
                .putObjectRequest(objectRequest)
                .build();

        String uploadUrl = s3Presigner.presignPutObject(presignRequest).url().toString();
        record(userId, key, folder, contentType, sizeBytes, isPublic);

        return new UploadTicket(
                uploadUrl, key, urlFor(key, isPublic), contentType,
                props.getPresignUploadTtlSeconds(), props.getMaxFileSizeBytes()
        );
    }

    /**
     * Confirm a presigned upload landed in S3 and return the final object.
     * Rejects anything that is missing or larger than the configured limit.
     */
    @Transactional
    public StoredFile confirmUpload(String key) {
        UUID userId = SecurityUtils.getCurrentUserId();
        UploadEntity record = uploadRepository.findByObjectKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Unknown upload key"));
        requireOwnership(record, userId);

        HeadObjectResponse head;
        try {
            head = s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(props.getBucket())
                    .key(key)
                    .build());
        } catch (NoSuchKeyException e) {
            uploadRepository.delete(record);
            throw new IllegalArgumentException("Upload was not completed");
        }

        if (head.contentLength() != null && head.contentLength() > props.getMaxFileSizeBytes()) {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(props.getBucket()).key(key).build());
            uploadRepository.delete(record);
            throw new IllegalArgumentException("File exceeds the "
                    + (props.getMaxFileSizeBytes() / (1024 * 1024)) + "MB limit");
        }

        record.setSizeBytes(head.contentLength());
        if (head.contentType() != null) {
            record.setContentType(head.contentType());
        }
        uploadRepository.save(record);

        return new StoredFile(key, urlFor(key, record.isPublic()),
                record.getContentType(), head.contentLength() == null ? 0 : head.contentLength(),
                record.isPublic());
    }

    // ==================== Read / delete ====================

    /**
     * Presigned GET URL for a private object. Only the uploader and admins may ask for one.
     */
    @Transactional(readOnly = true)
    public String generatePresignedUrl(String key) {
        uploadRepository.findByObjectKey(key)
                .ifPresent(record -> requireOwnership(record, SecurityUtils.getCurrentUserId()));
        return presign(key);
    }

    /** Presigned GET URL without an ownership check — for internal/admin callers only. */
    public String presign(String key) {
        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(props.getPresignDownloadTtlSeconds()))
                .getObjectRequest(getRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    /**
     * Delete an object. Only the uploader or an admin can; unregistered keys are
     * refused outright so a crafted URL cannot wipe someone else's file.
     */
    @Transactional
    public void delete(String key) {
        UUID userId = SecurityUtils.getCurrentUserId();
        UploadEntity record = uploadRepository.findByObjectKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Unknown file"));
        requireOwnership(record, userId);

        deleteQuietly(key);
        uploadRepository.delete(record);
        log.info("Deleted {} for user {}", key, userId);
    }

    /** Best-effort delete used during cleanup paths; never throws. */
    public void deleteQuietly(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(props.getBucket())
                    .key(key)
                    .build());
        } catch (Exception e) {
            log.warn("Failed to delete {} from S3: {}", key, e.getMessage());
        }
    }

    /**
     * Extract the object key from a stored URL. Handles both the S3 virtual-host form
     * and a configured CDN base, and strips any query string from presigned URLs.
     */
    public String extractKeyFromUrl(String url) {
        if (url == null || url.isBlank()) return null;

        String candidate = url;
        int query = candidate.indexOf('?');
        if (query >= 0) {
            candidate = candidate.substring(0, query);
        }

        for (String prefix : List.of(publicPrefix(), s3Prefix())) {
            if (!prefix.isBlank() && candidate.startsWith(prefix)) {
                return candidate.substring(prefix.length());
            }
        }
        // Already a bare key.
        return candidate.startsWith("http") ? null : candidate;
    }

    // ==================== Internals ====================

    private void record(UUID userId, String key, String folder, String contentType,
                        Long size, boolean isPublic) {
        UploadEntity entity = uploadRepository.findByObjectKey(key).orElseGet(UploadEntity::new);
        entity.setUserId(userId);
        entity.setObjectKey(key);
        entity.setFolder(folder);
        entity.setContentType(contentType);
        entity.setSizeBytes(size);
        entity.setPublic(isPublic);
        uploadRepository.save(entity);
    }

    private void requireOwnership(UploadEntity record, UUID userId) {
        if (record.getUserId().equals(userId)) return;
        boolean isAdmin = ADMIN_ROLES.stream().anyMatch(SecurityUtils::hasRole);
        if (!isAdmin) {
            throw new IllegalArgumentException("You do not have access to this file");
        }
    }

    /** KYC and certificate uploads belong to sellers (and admins acting on their behalf). */
    private void validateFolderAccess(String folder) {
        if (!ALLOWED_TYPES.containsKey(folder)) {
            throw new IllegalArgumentException(
                    "Invalid folder. Allowed: " + String.join(", ", ALLOWED_TYPES.keySet()));
        }
        if (SELLER_ONLY_FOLDERS.contains(folder)) {
            boolean allowed = SecurityUtils.hasRole(UserRole.SELLER)
                    || ADMIN_ROLES.stream().anyMatch(SecurityUtils::hasRole);
            if (!allowed) {
                throw new IllegalArgumentException("Only sellers can upload to '" + folder + "'");
            }
        }
    }

    private String validateFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > props.getMaxFileSizeBytes()) {
            throw new IllegalArgumentException("File exceeds the "
                    + (props.getMaxFileSizeBytes() / (1024 * 1024)) + "MB limit");
        }
        String contentType = file.getContentType();
        validateContentType(contentType, folder);
        return contentType;
    }

    private void validateContentType(String contentType, String folder) {
        Set<String> allowed = ALLOWED_TYPES.get(folder);
        if (contentType == null || !allowed.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Invalid file type for '" + folder
                    + "'. Allowed: " + String.join(", ", allowed));
        }
    }

    /**
     * Keys are {@code folder/userId/uuid.ext}. The extension comes from the validated
     * content type, never from the client-supplied filename, so a crafted name cannot
     * inject path separators or a misleading extension.
     */
    private String buildKey(String folder, UUID userId, String contentType, String originalFilename) {
        String extension = EXTENSION_BY_TYPE.getOrDefault(
                contentType == null ? "" : contentType.toLowerCase(Locale.ROOT), "");
        if (extension.isEmpty() && originalFilename != null && originalFilename.contains(".")) {
            String candidate = originalFilename.substring(originalFilename.lastIndexOf('.'));
            if (candidate.matches("^\\.[A-Za-z0-9]{1,5}$")) {
                extension = candidate.toLowerCase(Locale.ROOT);
            }
        }
        return folder + "/" + userId + "/" + UUID.randomUUID() + extension;
    }

    private String urlFor(String key, boolean isPublic) {
        return isPublic ? publicPrefix() + encodeKey(key) : presign(key);
    }

    private String publicPrefix() {
        String base = props.getPublicBaseUrl();
        if (base != null && !base.isBlank()) {
            return base.endsWith("/") ? base : base + "/";
        }
        return s3Prefix();
    }

    private String s3Prefix() {
        if (!props.getEndpoint().isBlank()) {
            String endpoint = props.getEndpoint().endsWith("/")
                    ? props.getEndpoint().substring(0, props.getEndpoint().length() - 1)
                    : props.getEndpoint();
            return props.isPathStyleAccess()
                    ? endpoint + "/" + props.getBucket() + "/"
                    : endpoint + "/";
        }
        return String.format("https://%s.s3.%s.amazonaws.com/", props.getBucket(), props.getRegion());
    }

    /** Percent-encode each path segment while keeping the slashes intact. */
    private static String encodeKey(String key) {
        StringJoiner joiner = new StringJoiner("/");
        for (String segment : key.split("/")) {
            joiner.add(URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20"));
        }
        return joiner.toString();
    }
}
