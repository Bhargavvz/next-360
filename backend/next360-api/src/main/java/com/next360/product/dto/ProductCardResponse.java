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
 *
 * <p>Field names deliberately mirror {@link ProductListResponse}. Both DTOs
 * describe the same thing to the same clients — {@code /search} returns this one
 * and {@code /products} returns the other — so any divergence shows up as
 * silently missing data rather than an error. This DTO previously called the
 * image {@code imageUrl} and exposed only a boolean {@code inStock}, which is
 * why product images never rendered on either the web grid or the app.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCardResponse {

    private UUID id;
    private String name;
    private String slug;

    /** Primary image, or the first available one. Named to match ProductListResponse. */
    private String primaryImageUrl;

    private BigDecimal price;
    private BigDecimal mrp;
    private BigDecimal rating;
    private int reviewCount;

    @JsonProperty("isVerifiedOrganic")
    private boolean verifiedOrganic;

    private String sellerName;
    private UUID sellerId;
    private String categoryName;

    /** Units available, so clients can show "only N left" rather than a bare flag. */
    private int stock;

    private ProductType productType;

    /** Convenience flag derived from {@link #stock}. */
    @JsonProperty("inStock")
    public boolean isInStock() {
        return stock > 0;
    }
}
