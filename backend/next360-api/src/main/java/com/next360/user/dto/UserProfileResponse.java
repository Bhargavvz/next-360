package com.next360.user.dto;

import com.next360.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * User profile response returned from /users/me endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;
    private String name;
    private String phone;
    private String email;
    private String avatarUrl;
    private boolean isPhoneVerified;
    private List<UserRole> roles;
    private Instant createdAt;
}
