package com.next360.seller.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.seller.dto.*;
import com.next360.seller.service.SellerService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Seller registration and profile management endpoints.
 *
 * POST /seller/register          → Register as seller (any authenticated user)
 * GET  /seller/me                → Own seller profile (SELLER role)
 * PUT  /seller/me                → Update seller profile (SELLER role)
 * GET  /sellers/{id}/profile     → Public seller profile (no auth)
 */
@RestController
public class SellerController {

    private static final Logger log = LoggerFactory.getLogger(SellerController.class);

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    /**
     * Register the current user as a seller.
     * Any authenticated user can register — they receive the SELLER role.
     */
    @PostMapping("/api/v1/seller/register")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> register(
            @Valid @RequestBody SellerRegistrationRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("Seller registration for user {}", userId);
        var profile = sellerService.registerAsSeller(userId, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Registered as seller successfully"));
    }

    /**
     * Get own seller profile (requires SELLER role).
     */
    @GetMapping("/api/v1/seller/me")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> getOwnProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var profile = sellerService.getSellerProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Update own seller profile (requires SELLER role).
     */
    @PutMapping("/api/v1/seller/me")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<SellerProfileResponse>> updateOwnProfile(
            @Valid @RequestBody UpdateSellerRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var profile = sellerService.updateSellerProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Seller profile updated"));
    }

    /**
     * Public seller profile visible to buyers (no auth required).
     */
    @GetMapping("/api/v1/sellers/{sellerId}/profile")
    public ResponseEntity<ApiResponse<PublicSellerResponse>> getPublicProfile(@PathVariable UUID sellerId) {
        var profile = sellerService.getPublicProfile(sellerId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
