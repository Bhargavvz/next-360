package com.next360.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Request to add an item to the cart.
 */
@Data
public class AddToCartRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    /** Optional — if product has variants, specify which one */
    private UUID variantId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;
}
