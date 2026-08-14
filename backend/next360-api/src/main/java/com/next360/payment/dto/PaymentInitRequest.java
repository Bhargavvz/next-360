package com.next360.payment.dto;

import com.next360.common.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Chooses how an order is paid for. Sent when starting checkout.
 */
@Data
public class PaymentInitRequest {

    @NotNull(message = "Payment method is required")
    private PaymentMethod method = PaymentMethod.RAZORPAY;
}
