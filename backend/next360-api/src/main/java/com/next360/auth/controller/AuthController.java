package com.next360.auth.controller;

import com.next360.auth.dto.*;
import com.next360.auth.service.AuthService;
import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints.
 *
 * POST /auth/otp/request  → Send OTP
 * POST /auth/otp/verify   → Verify OTP → JWT
 * POST /auth/refresh       → Refresh access token
 * POST /auth/logout        → Revoke refresh token
 * GET  /auth/me            → Get current user (requires auth)
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Request OTP for phone-based login. Also used for resends — the service
     * enforces the cooldown and per-phone rate limit.
     */
    @PostMapping("/otp/request")
    public ResponseEntity<ApiResponse<OtpChallengeResponse>> requestOtp(@Valid @RequestBody OtpRequest request) {
        String phone = request.getPhone();
        log.info("OTP requested for phone: {}", maskPhone(phone));

        var challenge = authService.requestOtp(phone);
        var response = OtpChallengeResponse.builder()
                .phone(maskPhone(phone))
                .expiresIn(challenge.expiresInSeconds())
                .resendIn(challenge.resendInSeconds())
                .devMode(challenge.devMode())
                .devOtp(challenge.devOtp())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "OTP sent successfully"));
    }

    /**
     * Verify OTP and get JWT tokens.
     * Creates a new user account if the phone number is new.
     */
    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        log.info("OTP verification for phone: {}", maskPhone(request.getPhone()));
        AuthResponse response = authService.verifyOtpAndLogin(request.getPhone(), request.getOtp());
        String message = response.getUserProfile().isNewUser()
                ? "Account created and logged in successfully"
                : "Logged in successfully";
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    /**
     * Refresh access token using a valid refresh token.
     * Issues a new token pair and revokes the old refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed"));
    }

    /**
     * Logout by revoking the refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshTokenRequest request) {
        // Clients that already dropped their tokens locally may call this with no body —
        // treat that as a no-op success rather than a 400.
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            authService.logout(request.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    /**
     * Get the current authenticated user's profile.
     * Requires a valid Bearer token.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserProfile>> me() {
        var userId = SecurityUtils.getCurrentUserId();
        var profile = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /** Masks a phone number so it never lands in logs or responses in full. */
    private static String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return "****";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}
