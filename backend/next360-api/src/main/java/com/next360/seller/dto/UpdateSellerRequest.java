package com.next360.seller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request to update seller profile. All fields are optional — only non-null fields are updated.
 */
@Data
public class UpdateSellerRequest {

    @Size(max = 200, message = "Business name must not exceed 200 characters")
    private String businessName;

    @Size(max = 2000, message = "Business description must not exceed 2000 characters")
    private String businessDescription;

    @Size(max = 500, message = "Business address must not exceed 500 characters")
    private String businessAddress;

    @Email(message = "Must be a valid email address")
    private String email;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;

    @Size(max = 500, message = "Banner URL must not exceed 500 characters")
    private String bannerUrl;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;
}
