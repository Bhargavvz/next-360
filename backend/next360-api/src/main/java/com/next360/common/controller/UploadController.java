package com.next360.common.controller;

import com.next360.common.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * General-purpose file upload endpoint.
 * Uploads files to S3 and returns the public URL.
 */
@RestController
@RequestMapping("/api/v1/uploads")
public class UploadController {

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Upload a file to S3.
     *
     * @param file   the file to upload
     * @param folder the folder prefix (products, kyc, certificates, avatars)
     * @return JSON with the public URL
     */
    @PostMapping
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "products") String folder
    ) {
        // Validate folder
        if (!folder.matches("^(products|kyc|certificates|avatars|misc)$")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid folder. Allowed: products, kyc, certificates, avatars, misc"
            ));
        }

        String url = storageService.upload(file, folder);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("url", url)
        ));
    }

    /**
     * Delete a file from S3 by URL.
     */
    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam("url") String url) {
        String key = storageService.extractKeyFromUrl(url);
        if (key != null) {
            storageService.delete(key);
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}
