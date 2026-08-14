package com.next360.product.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.next360.common.enums.ProductStatus;
import com.next360.common.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full product detail response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private UUID id;
    private String slug;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal mrp;
    private ProductType productType;
    private ProductStatus status;
    private BigDecimal rating;
    private int reviewCount;
    private int stock;
    private String sku;
    private String weight;
    private String dimensions;
    private String ingredients;
    private String nutritionalInfo;
    private String origin;
    private String storageInstructions;
    @JsonProperty("isVerifiedOrganic")
    private boolean verifiedOrganic;
    private UUID verificationId;

    // Category
    private UUID categoryId;
    private String categoryName;
    private String categorySlug;

    // Seller
    private UUID sellerId;
    private String sellerName;
    private String sellerLogoUrl;

    // Nested
    private List<ImageDto> images;
    private List<VariantDto> variants;

    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageDto {
        private UUID id;
        private String url;
        private String altText;
        private int sortOrder;
        @JsonProperty("isPrimary")
        private boolean primary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantDto {
        private UUID id;
        private String name;
        private String value;
        private BigDecimal price;
        private BigDecimal mrp;
        private int stock;
        private String sku;
        private String weight;
    }
}
