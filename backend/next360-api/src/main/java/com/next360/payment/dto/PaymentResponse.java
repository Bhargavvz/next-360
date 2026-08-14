package com.next360.payment.dto;

import com.next360.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Payment record response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private BigDecimal amount;
    private PaymentStatus status;
    private String paymentMethod;
    private String gatewayPaymentId;
    private String gatewayOrderId;
    private String failureReason;
    private BigDecimal refundedAmount;
    private Instant paidAt;
    private Instant createdAt;
}
