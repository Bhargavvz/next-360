package com.next360.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Wishlist item response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemResponse {

    private UUID id;
    private UUID productId;
    private String productName;
    private String productSlug;
    private String productImageUrl;
    private BigDecimal price;
    private BigDecimal mrp;
    private boolean inStock;
    private boolean isVerifiedOrganic;
    private Instant addedAt;
}
