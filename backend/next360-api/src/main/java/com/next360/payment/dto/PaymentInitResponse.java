package com.next360.payment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.next360.common.enums.PaymentMethod;
import com.next360.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Everything the client needs to open the gateway checkout — or, for COD,
 * confirmation that the order is already placed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentInitResponse {

    private UUID paymentId;
    private UUID orderId;
    private String orderNumber;
    private PaymentMethod method;
    private PaymentStatus status;

    /** Razorpay order id — null for COD. */
    private String gatewayOrderId;

    /** Rupee amount shown to the user. */
    private BigDecimal amount;

    /** Amount in the gateway's smallest unit (paise) — pass this straight to checkout. */
    private long amountInPaise;

    private String currency;

    /** Razorpay publishable key id — null for COD. */
    private String keyId;

    /** True when no real gateway is configured and the flow is simulated locally. */
    private boolean mock;

    /** Prefill hints for the checkout widget. */
    private String customerName;
    private String customerPhone;
    private String customerEmail;
}
