package com.next360.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Full cart with items and computed totals.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private List<CartItemResponse> items;
    private int itemCount;

    /** Sum of line totals at the current selling price. */
    private BigDecimal subtotal;

    private BigDecimal totalMrp;

    /** Savings against MRP (not a coupon discount). */
    private BigDecimal discount;

    /** Delivery fee for this subtotal — 0 once the free-delivery threshold is met. */
    private BigDecimal shippingAmount;

    /** Subtotal + shipping. Coupons are applied at checkout, not here. */
    private BigDecimal totalAmount;

    /** Spend needed to unlock free delivery; 0 when already free. */
    private BigDecimal freeDeliveryRemaining;

    /** True when any line has more quantity than the seller currently has in stock. */
    private boolean hasStockIssues;
}
