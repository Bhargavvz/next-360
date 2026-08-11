package com.next360.product.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.product.dto.CertificateRequest;
import com.next360.product.dto.CertificateResponse;
import com.next360.product.service.CertificateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Certificate management endpoints.
 */
@RestController
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    /**
     * Upload a certificate for a product (seller only).
     */
    @PostMapping("/api/v1/seller/certificates")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<CertificateResponse>> uploadCertificate(
            @Valid @RequestBody CertificateRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var cert = certificateService.uploadCertificate(userId, request);
        return ResponseEntity.ok(ApiResponse.success(cert, "Certificate uploaded for review"));
    }

    /**
     * List seller's own certificates (seller only).
     */
    @GetMapping("/api/v1/seller/certificates")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getSellerCertificates() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var certs = certificateService.getSellerCertificates(userId);
        return ResponseEntity.ok(ApiResponse.success(certs));
    }

    /**
     * View certificates for a product (public — trust transparency).
     */
    @GetMapping("/api/v1/products/{productId}/certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getProductCertificates(
            @PathVariable UUID productId) {
        var certs = certificateService.getProductCertificates(productId);
        return ResponseEntity.ok(ApiResponse.success(certs));
    }
}
