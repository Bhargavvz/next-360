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
    private BigDecimal subtotal;
    private BigDecimal totalMrp;
    private BigDecimal discount;
}
