package com.next360.order.dto;

import com.next360.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Seller's view of their sub-order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerOrderResponse {

    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal commissionAmount;
    private BigDecimal netAmount;
    private String trackingNumber;
    private String courierName;
    private Instant shippedAt;
    private Instant deliveredAt;
    private List<OrderResponse.OrderItemDto> items;
    private OrderResponse.AddressDto shippingAddress;
    private String buyerName;
    private String buyerPhone;
    private Instant createdAt;
}
