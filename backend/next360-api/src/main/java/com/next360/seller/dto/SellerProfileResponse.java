package com.next360.seller.dto;

import com.next360.common.enums.KycStatus;
import com.next360.common.enums.SellerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Full seller profile response for the seller's own dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProfileResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private String businessName;
    private String businessDescription;
    private String businessAddress;
    private String gstin;
    private String panNumber;
    private String phone;
    private String email;
    private String logoUrl;
    private String bannerUrl;
    private String location;
    private SellerStatus status;
    private KycStatus kycStatus;
    private BigDecimal rating;
    private int totalOrders;
    private int totalProducts;
    private BigDecimal commissionPercentage;
    private Instant createdAt;
    private Instant updatedAt;
}
