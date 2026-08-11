package com.next360.product.dto;

import com.next360.common.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Lightweight product for list/search results (no full description, images, variants).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductListResponse {

    private UUID id;
    private String slug;
    private String name;
    private BigDecimal price;
    private BigDecimal mrp;
    private String primaryImageUrl;
    private BigDecimal rating;
    private int reviewCount;
    private ProductType productType;
    private boolean isVerifiedOrganic;
    private int stock;
    private String sellerName;
    private UUID sellerId;
    private String categoryName;
}
