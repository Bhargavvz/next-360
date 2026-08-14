package com.next360.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request to verify an OTP and obtain JWT tokens.
 */
@Data
public class OtpVerifyRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+91[6-9]\\d{9}$", message = "Must be a valid Indian mobile number starting with +91")
    private String phone;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
    private String otp;
}
