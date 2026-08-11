package com.next360.seller.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.seller.dto.KycResponse;
import com.next360.seller.dto.KycUploadRequest;
import com.next360.seller.service.KycService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Seller KYC document endpoints.
 */
@RestController
@RequestMapping("/api/v1/seller/kyc")
@PreAuthorize("hasRole('SELLER')")
public class KycController {

    private final KycService kycService;

    public KycController(KycService kycService) {
        this.kycService = kycService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KycResponse>> uploadKycDocument(
            @Valid @RequestBody KycUploadRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var kyc = kycService.uploadKycDocument(userId, request);
        return ResponseEntity.ok(ApiResponse.success(kyc, "KYC document uploaded for review"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<KycResponse>>> getMyKycDocuments() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var docs = kycService.getMyKycDocuments(userId);
        return ResponseEntity.ok(ApiResponse.success(docs));
    }
}
