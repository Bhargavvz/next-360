package com.next360.admin.controller;

import com.next360.admin.dto.AdminStatsResponse;
import com.next360.admin.dto.VerificationDecisionRequest;
import com.next360.admin.service.AdminVerificationService;
import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.product.dto.CertificateResponse;
import com.next360.seller.dto.KycResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin verification dashboard and approval workflows.
 * All endpoints require admin roles (enforced by SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminVerificationController {

    private final AdminVerificationService adminService;

    public AdminVerificationController(AdminVerificationService adminService) {
        this.adminService = adminService;
    }

    // ==================== Dashboard ====================

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        var stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== Certificate Review ====================

    @GetMapping("/certificates/pending")
    public ResponseEntity<ApiResponse<Page<CertificateResponse>>> getPendingCertificates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        var results = adminService.getPendingCertificates(pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/certificates/{certId}/review")
    public ResponseEntity<ApiResponse<CertificateResponse>> reviewCertificate(
            @PathVariable UUID certId,
            @Valid @RequestBody VerificationDecisionRequest decision) {
        String adminName = SecurityUtils.getCurrentUserId().toString();
        var cert = adminService.reviewCertificate(certId, decision, adminName);
        String msg = decision.getApproved() ? "Certificate approved" : "Certificate rejected";
        return ResponseEntity.ok(ApiResponse.success(cert, msg));
    }

    // ==================== KYC Review ====================

    @GetMapping("/kyc/pending")
    public ResponseEntity<ApiResponse<Page<KycResponse>>> getPendingKyc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "uploadedAt"));
        var results = adminService.getPendingKyc(pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/kyc/{kycId}/review")
    public ResponseEntity<ApiResponse<KycResponse>> reviewKyc(
            @PathVariable UUID kycId,
            @Valid @RequestBody VerificationDecisionRequest decision) {
        String adminName = SecurityUtils.getCurrentUserId().toString();
        var kyc = adminService.reviewKyc(kycId, decision, adminName);
        String msg = decision.getApproved() ? "KYC approved" : "KYC rejected";
        return ResponseEntity.ok(ApiResponse.success(kyc, msg));
    }

    // ==================== Seller Review ====================

    @GetMapping("/sellers/pending")
    public ResponseEntity<ApiResponse<Page<?>>> getPendingSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        var results = adminService.getPendingSellers(pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/sellers/{sellerId}/review")
    public ResponseEntity<ApiResponse<Void>> reviewSeller(
            @PathVariable UUID sellerId,
            @Valid @RequestBody VerificationDecisionRequest decision) {
        String adminName = SecurityUtils.getCurrentUserId().toString();
        adminService.reviewSeller(sellerId, decision, adminName);
        String msg = decision.getApproved() ? "Seller approved" : "Seller rejected";
        return ResponseEntity.ok(ApiResponse.success(null, msg));
    }

    // ==================== Product Review ====================

    @GetMapping("/products/pending")
    public ResponseEntity<ApiResponse<Page<?>>> getPendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        var results = adminService.getPendingProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/products/{productId}/review")
    public ResponseEntity<ApiResponse<Void>> reviewProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody VerificationDecisionRequest decision) {
        String adminName = SecurityUtils.getCurrentUserId().toString();
        adminService.reviewProduct(productId, decision, adminName);
        String msg = decision.getApproved() ? "Product approved" : "Product rejected";
        return ResponseEntity.ok(ApiResponse.success(null, msg));
    }
}
