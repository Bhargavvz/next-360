package com.next360.user.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.user.dto.*;
import com.next360.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * User profile and address management endpoints.
 * All endpoints require authentication (any role).
 */
@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ==================== Profile ====================

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var profile = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var profile = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated"));
    }

    // ==================== Addresses ====================

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var addresses = userService.getAddresses(userId);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @GetMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddress(@PathVariable UUID addressId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(userService.getAddress(userId, addressId)));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @Valid @RequestBody AddressRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var address = userService.addAddress(userId, request);
        return ResponseEntity.ok(ApiResponse.success(address, "Address added"));
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var address = userService.updateAddress(userId, addressId, request);
        return ResponseEntity.ok(ApiResponse.success(address, "Address updated"));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable UUID addressId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        userService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted"));
    }

    @PatchMapping("/addresses/{addressId}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(@PathVariable UUID addressId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var address = userService.setDefaultAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success(address, "Default address updated"));
    }
}
