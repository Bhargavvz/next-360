package com.next360.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Cart item response with current product info (prices always reflect live data).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private UUID id;
    private UUID productId;
    private String productName;
    private String productSlug;
    private String productImageUrl;
    private UUID variantId;
    private String variantName;
    private String variantValue;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal unitMrp;
    private BigDecimal lineTotal;
    private int availableStock;
    private boolean inStock;
    private Instant addedAt;
}
