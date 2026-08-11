package com.next360.seller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Public-facing seller profile shown to buyers when browsing.
 * Excludes sensitive fields like GSTIN, PAN, commission, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicSellerResponse {

    private UUID id;
    private String businessName;
    private String businessDescription;
    private String logoUrl;
    private String bannerUrl;
    private String location;
    private BigDecimal rating;
    private int totalOrders;
    private int totalProducts;
    private Instant memberSince;
}
