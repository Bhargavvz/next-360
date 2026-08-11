package com.next360.seller.dto;

import com.next360.common.enums.KycStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * KYC document response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycResponse {

    private UUID id;
    private String documentType;
    private String documentUrl;
    private KycStatus status;
    private String rejectionReason;
    private Instant uploadedAt;
    private Instant verifiedAt;
    private String verifiedBy;
}
