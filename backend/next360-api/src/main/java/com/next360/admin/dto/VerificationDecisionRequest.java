package com.next360.admin.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Admin's approve/reject decision for certificates, KYC, sellers, products.
 */
@Data
public class VerificationDecisionRequest {

    @NotNull(message = "Decision is required")
    private Boolean approved;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
