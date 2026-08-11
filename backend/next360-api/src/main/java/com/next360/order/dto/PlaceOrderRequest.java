package com.next360.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * Place order from cart.
 */
@Data
public class PlaceOrderRequest {

    @NotNull(message = "Shipping address is required")
    private UUID shippingAddressId;

    @Size(max = 50)
    private String couponCode;

    @Size(max = 500)
    private String deliveryNotes;
}
