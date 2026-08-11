package com.next360.order.dto;

import com.next360.common.enums.OrderStatus;
import com.next360.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full order response for buyer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal shippingAmount;
    private BigDecimal finalAmount;
    private String couponCode;
    private String deliveryNotes;
    private List<OrderItemDto> items;
    private AddressDto shippingAddress;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private UUID id;
        private String productName;
        private String productImageUrl;
        private String variantName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private UUID productId;
        private UUID sellerId;
        private String sellerName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {
        private String name;
        private String addressLine1;
        private String city;
        private String state;
        private String pincode;
        private String phone;
    }
}
