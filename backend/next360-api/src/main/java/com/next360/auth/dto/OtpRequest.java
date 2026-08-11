package com.next360.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request to send an OTP to a phone number.
 */
@Data
public class OtpRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+91[6-9]\\d{9}$", message = "Must be a valid Indian mobile number starting with +91")
    private String phone;
}
