package com.next360.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Payment verification after gateway callback.
 */
@Data
public class PaymentVerifyRequest {

    @NotNull(message = "Order ID is required")
    private UUID orderId;

    @NotBlank(message = "Gateway payment ID is required")
    private String gatewayPaymentId;

    @NotBlank(message = "Gateway order ID is required")
    private String gatewayOrderId;

    @NotBlank(message = "Gateway signature is required")
    private String gatewaySignature;
}
