package com.next360.product.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.next360.common.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Lightweight product card for search results and listings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCardResponse {

    private UUID id;
    private String name;
    private String slug;
    private String imageUrl;
    private BigDecimal price;
    private BigDecimal mrp;
    private BigDecimal rating;
    private int reviewCount;
    @JsonProperty("isVerifiedOrganic")
    private boolean verifiedOrganic;
    private String sellerName;
    private String categoryName;
    private boolean inStock;
    private ProductType productType;
}
