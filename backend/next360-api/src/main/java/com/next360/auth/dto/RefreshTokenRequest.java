package com.next360.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request to refresh an access token using a refresh token.
 */
@Data
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
