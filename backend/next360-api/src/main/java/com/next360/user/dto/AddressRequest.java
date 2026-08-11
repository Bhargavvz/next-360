package com.next360.user.dto;

import com.next360.common.enums.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request to create or update a delivery address.
 */
@Data
public class AddressRequest {

    @NotNull(message = "Address type is required")
    private AddressType type;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+91[6-9]\\d{9}$", message = "Must be a valid Indian mobile number")
    private String phone;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    private String addressLine1;

    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String addressLine2;

    @Size(max = 255, message = "Landmark must not exceed 255 characters")
    private String landmark;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Must be a valid 6-digit Indian pincode")
    private String pincode;

    private boolean isDefault = false;

    @Size(max = 500, message = "Delivery instructions must not exceed 500 characters")
    private String deliveryInstructions;
}
