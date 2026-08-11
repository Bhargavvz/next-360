package com.next360.seller.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request to register as a seller on the platform.
 * Converts a BUYER user into a SELLER.
 */
@Data
public class SellerRegistrationRequest {

    @NotBlank(message = "Business name is required")
    @Size(max = 200, message = "Business name must not exceed 200 characters")
    private String businessName;

    @Size(max = 2000, message = "Business description must not exceed 2000 characters")
    private String businessDescription;

    @NotBlank(message = "Business address is required")
    @Size(max = 500, message = "Business address must not exceed 500 characters")
    private String businessAddress;

    @NotBlank(message = "Business phone is required")
    @Pattern(regexp = "^\\+91[6-9]\\d{9}$", message = "Must be a valid Indian mobile number")
    private String phone;

    @NotBlank(message = "Business email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
            message = "Must be a valid GSTIN")
    private String gstin;

    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "Must be a valid PAN number")
    private String panNumber;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;
}
