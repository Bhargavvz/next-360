package com.next360.common.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.service.StorageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * File upload endpoints.
 *
 * <pre>
 * POST   /uploads                 → upload through the API (multipart)
 * POST   /uploads/presign         → get a presigned PUT URL for a direct S3 upload
 * POST   /uploads/confirm         → confirm a direct upload landed
 * GET    /uploads/signed-url      → presigned GET URL for a private object
 * DELETE /uploads                 → delete an object you own
 * </pre>
 *
 * All endpoints require authentication; folder-level rules (kyc/certificates are
 * seller-only) and per-object ownership are enforced in {@link StorageService}.
 */
@RestController
@RequestMapping("/api/v1/uploads")
public class UploadController {

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @Data
    public static class PresignRequest {
        @NotBlank(message = "Folder is required")
        private String folder;

        @NotBlank(message = "Content type is required")
        private String contentType;

        /** Optional — lets the server reject oversized files before the upload starts. */
        private Long sizeBytes;
    }

    @Data
    public static class ConfirmRequest {
        @NotBlank(message = "Object key is required")
        private String key;
    }

    /**
     * Upload a file through the API.
     *
     * @param folder products, avatars, misc, kyc or certificates
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<StorageService.StoredFile>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "products") String folder) {
        var stored = storageService.upload(file, folder);
        return ResponseEntity.ok(ApiResponse.success(stored, "File uploaded"));
    }

    /**
     * Request a presigned PUT URL so the client can upload straight to S3,
     * keeping large files off the API.
     */
    @PostMapping("/presign")
    public ResponseEntity<ApiResponse<StorageService.UploadTicket>> presignUpload(
            @Valid @RequestBody PresignRequest request) {
        var ticket = storageService.createUploadTicket(
                request.getFolder(), request.getContentType(), request.getSizeBytes());
        return ResponseEntity.ok(ApiResponse.success(ticket, "Upload URL created"));
    }

    /** Confirm a presigned upload finished, returning the final object metadata. */
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<StorageService.StoredFile>> confirmUpload(
            @Valid @RequestBody ConfirmRequest request) {
        var stored = storageService.confirmUpload(request.getKey());
        return ResponseEntity.ok(ApiResponse.success(stored, "Upload confirmed"));
    }

    /** Presigned GET URL for a private object (KYC documents, certificates). */
    @GetMapping("/signed-url")
    public ResponseEntity<ApiResponse<String>> signedUrl(@RequestParam("key") String key) {
        return ResponseEntity.ok(ApiResponse.success(storageService.generatePresignedUrl(key)));
    }

    /**
     * Delete a file. Accepts either the object key or the full URL it was stored under.
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @RequestParam(value = "key", required = false) String key,
            @RequestParam(value = "url", required = false) String url) {
        String objectKey = key != null && !key.isBlank()
                ? key
                : storageService.extractKeyFromUrl(url);

        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("Provide either 'key' or a valid 'url'");
        }

        storageService.delete(objectKey);
        return ResponseEntity.ok(ApiResponse.success(null, "File deleted"));
    }
}
