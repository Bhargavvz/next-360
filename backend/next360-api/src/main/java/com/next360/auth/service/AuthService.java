package com.next360.auth.service;

import com.next360.auth.dto.AuthResponse;
import com.next360.common.enums.UserRole;
import com.next360.common.security.JwtService;
import com.next360.user.entity.UserEntity;
import com.next360.user.entity.UserRoleEntity;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Core authentication service.
 * Handles the OTP → User → JWT flow.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final OtpService otpService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthService(OtpService otpService, JwtService jwtService, UserRepository userRepository) {
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Request OTP for the given phone number.
     * Returns the challenge metadata (validity + resend cooldown) for the client.
     */
    public OtpService.OtpChallenge requestOtp(String phone) {
        return otpService.requestOtp(phone);
    }

    /**
     * Verify OTP and return JWT tokens.
     * Creates a new user with BUYER role if the phone doesn't exist.
     */
    @Transactional
    public AuthResponse verifyOtpAndLogin(String phone, String otp) {
        if (!otpService.verifyOtp(phone, otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        boolean isNewUser = !userRepository.existsByPhone(phone);
        UserEntity user;

        if (isNewUser) {
            user = createNewUser(phone);
            log.info("New user created with phone {}", phone);
        } else {
            user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new IllegalStateException("User not found after existence check"));
        }

        if (!user.isActive()) {
            throw new IllegalStateException("Account is deactivated. Contact support.");
        }

        // Mark phone as verified
        if (!user.isPhoneVerified()) {
            user.setPhoneVerified(true);
            userRepository.save(user);
        }

        return buildAuthResponse(user, isNewUser);
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        var claims = jwtService.validateRefreshToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        UUID userId = jwtService.getUserIdFromClaims(claims);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive()) {
            throw new IllegalStateException("Account is deactivated");
        }

        // Revoke old refresh token and issue new pair
        jwtService.revokeRefreshToken(refreshToken);

        return buildAuthResponse(user, false);
    }

    /**
     * Logout by revoking the refresh token.
     */
    public void logout(String refreshToken) {
        jwtService.revokeRefreshToken(refreshToken);
        log.info("Refresh token revoked");
    }

    /**
     * Get current user profile by ID.
     */
    @Transactional(readOnly = true)
    public AuthResponse.UserProfile getCurrentUser(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<UserRole> roles = user.getRoles().stream()
                .map(UserRoleEntity::getRole)
                .toList();

        return AuthResponse.UserProfile.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .roles(roles)
                .newUser(false)
                .build();
    }

    // ---- Private helpers ----

    private UserEntity createNewUser(String phone) {
        UserEntity user = new UserEntity(phone);
        user.setPhoneVerified(true);
        user = userRepository.save(user);

        // Assign default BUYER role
        UserRoleEntity buyerRole = new UserRoleEntity(user, UserRole.BUYER);
        user.addRole(buyerRole);
        user = userRepository.save(user);

        return user;
    }

    private AuthResponse buildAuthResponse(UserEntity user, boolean isNewUser) {
        List<UserRole> roles = user.getRoles().stream()
                .map(UserRoleEntity::getRole)
                .toList();

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getPhone(), roles);
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        AuthResponse.UserProfile profile = AuthResponse.UserProfile.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .roles(roles)
                .newUser(isNewUser)
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getAccessTokenExpiration())
                .userProfile(profile)
                .build();
    }
}
