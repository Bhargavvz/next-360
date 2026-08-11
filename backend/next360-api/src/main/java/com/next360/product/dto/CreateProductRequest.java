package com.next360.product.dto;

import com.next360.common.enums.ProductType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Request to create a new product listing.
 */
@Data
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 10000, message = "Description must not exceed 10000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.01")
    private BigDecimal mrp;

    @NotNull(message = "Category is required")
    private UUID categoryId;

    @NotNull(message = "Product type is required")
    private ProductType productType;

    @Min(value = 0, message = "Stock cannot be negative")
    private int stock = 0;

    @Size(max = 50)
    private String sku;

    @Size(max = 50)
    private String weight;

    @Size(max = 100)
    private String dimensions;

    @Size(max = 5000)
    private String ingredients;

    @Size(max = 5000)
    private String nutritionalInfo;

    @Size(max = 200)
    private String origin;

    @Size(max = 500)
    private String storageInstructions;

    @Valid
    private List<ProductImageRequest> images;

    @Valid
    private List<ProductVariantRequest> variants;
}
