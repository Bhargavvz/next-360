package com.next360.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Payment initiation response — contains gateway order ID for frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitResponse {

    private UUID paymentId;
    private String gatewayOrderId;
    private BigDecimal amount;
    private String currency;
    private String keyId; // Razorpay key for frontend
}
