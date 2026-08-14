package com.next360.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.next360.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Response returned after successful OTP verification or token refresh.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserProfile userProfile;

    /**
     * Nested user profile returned with auth tokens.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfile {
        private UUID id;
        private String name;
        private String phone;
        private String email;
        private String avatarUrl;
        private List<UserRole> roles;
        @JsonProperty("isNewUser")
        private boolean newUser;
    }
}
