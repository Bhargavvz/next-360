package com.next360.product.dto;

import com.next360.common.enums.CertificateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Certificate response with verification status and product/seller info.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponse {

    private UUID id;
    private String certificateNumber;
    private String certificationBody;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String documentUrl;
    private CertificateStatus status;
    private Instant verifiedAt;
    private String verifiedBy;
    private String rejectionReason;
    private String revocationReason;

    // Product info
    private UUID productId;
    private String productName;
    private String productSlug;

    // Seller info
    private UUID sellerId;
    private String sellerBusinessName;

    private Instant createdAt;
}
