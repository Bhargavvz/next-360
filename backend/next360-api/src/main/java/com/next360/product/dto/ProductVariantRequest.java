package com.next360.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Product variant in create/update requests.
 */
@Data
public class ProductVariantRequest {

    @NotBlank(message = "Variant name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Variant value is required")
    @Size(max = 100)
    private String value;

    @NotNull(message = "Variant price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.01")
    private BigDecimal mrp;

    @Min(0)
    private int stock = 0;

    @Size(max = 50)
    private String sku;

    @Size(max = 50)
    private String weight;
}
