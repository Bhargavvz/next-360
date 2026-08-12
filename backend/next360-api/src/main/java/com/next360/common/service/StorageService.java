package com.next360.common.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * Storage service for file uploads to AWS S3.
 * Supports product images, KYC documents, and certificates.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/jpg", "image/png"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${next360.s3.bucket:next360-uploads-2402}")
    private String bucketName;

    @Value("${next360.s3.region:ap-south-1}")
    private String region;

    public StorageService(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    /**
     * Upload a file to S3 under the given folder prefix.
     *
     * @param file   the multipart file to upload
     * @param folder the S3 key prefix (e.g., "products", "kyc", "certificates")
     * @return the public URL of the uploaded file
     */
    public String upload(MultipartFile file, String folder) {
        validateFile(file, folder);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String key = folder + "/" + UUID.randomUUID() + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String url = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
            log.info("File uploaded to S3: {}", url);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    /**
     * Generate a presigned URL for a private object (valid for 1 hour).
     */
    public String generatePresignedUrl(String key) {
        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(getRequest)
                .build();

        URL url = s3Presigner.presignGetObject(presignRequest).url();
        return url.toString();
    }

    /**
     * Delete an object from S3 by its key.
     */
    public void delete(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
            log.info("File deleted from S3: {}", key);
        } catch (Exception e) {
            log.warn("Failed to delete file from S3: {}", key, e);
        }
    }

    /**
     * Extract the S3 key from a full URL.
     */
    public String extractKeyFromUrl(String url) {
        if (url == null) return null;
        String prefix = String.format("https://%s.s3.%s.amazonaws.com/", bucketName, region);
        if (url.startsWith(prefix)) {
            return url.substring(prefix.length());
        }
        return url;
    }

    private void validateFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        String contentType = file.getContentType();
        boolean isDocumentFolder = "kyc".equals(folder) || "certificates".equals(folder);

        if (isDocumentFolder) {
            if (!ALLOWED_DOCUMENT_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Invalid file type. Allowed: PDF, JPEG, PNG");
            }
        } else {
            if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, WebP");
            }
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
