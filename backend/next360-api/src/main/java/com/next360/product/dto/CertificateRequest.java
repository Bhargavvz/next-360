package com.next360.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request to upload a product certification (NPOP, FSSAI, etc.).
 */
@Data
public class CertificateRequest {

    @NotBlank(message = "Certificate number is required")
    @Size(max = 100)
    private String certificateNumber;

    @NotBlank(message = "Certification body is required")
    @Size(max = 200)
    private String certificationBody;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    @NotBlank(message = "Document URL is required")
    @Size(max = 500)
    private String documentUrl;
}
