package com.next360.payment.entity;

import com.next360.common.entity.BaseEntity;
import com.next360.common.enums.PaymentStatus;
import com.next360.order.entity.OrderEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Payment record for an order.
 * Stores payment gateway response data (Razorpay IDs).
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class PaymentEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 25)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod;

    @Column(name = "gateway_payment_id", length = 100)
    private String gatewayPaymentId;

    @Column(name = "gateway_order_id", length = 100)
    private String gatewayOrderId;

    @Column(name = "gateway_signature", length = 255)
    private String gatewaySignature;

    @Column(name = "paid_at")
    private Instant paidAt;

    /** Gateway-reported reason when the payment ends up FAILED. */
    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "refunded_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    /** Receipt string sent to the gateway — the Next360 order number. */
    @Column(name = "gateway_receipt", length = 100)
    private String gatewayReceipt;
}
