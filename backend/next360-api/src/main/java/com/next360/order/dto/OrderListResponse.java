package com.next360.order.dto;

import com.next360.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight order for listing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponse {

    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal finalAmount;
    private int itemCount;
    private String firstProductName;
    private String firstProductImage;
    private Instant createdAt;
}
