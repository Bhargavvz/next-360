package com.next360.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * Reported by the client when the gateway checkout fails or is dismissed,
 * so the pending payment does not linger forever.
 */
@Data
public class PaymentFailureRequest {

    @NotNull(message = "Order ID is required")
    private UUID orderId;

    private String gatewayOrderId;

    private String gatewayPaymentId;

    @Size(max = 500)
    private String reason;
}
