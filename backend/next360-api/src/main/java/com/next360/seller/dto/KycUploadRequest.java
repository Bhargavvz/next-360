package com.next360.seller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request to upload a KYC document for seller verification.
 */
@Data
public class KycUploadRequest {

    @NotBlank(message = "Document type is required")
    @Size(max = 50)
    private String documentType; // PAN, GSTIN, FSSAI, BUSINESS_LICENSE

    @NotBlank(message = "Document URL is required")
    @Size(max = 500)
    private String documentUrl;
}
