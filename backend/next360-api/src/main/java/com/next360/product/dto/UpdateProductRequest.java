package com.next360.product.dto;

import com.next360.common.enums.ProductType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Request to update a product. All fields optional — only non-null fields are updated.
 * Images and variants are full-replacement: sending them replaces all existing ones.
 */
@Data
public class UpdateProductRequest {

    @Size(max = 200)
    private String name;

    @Size(max = 10000)
    private String description;

    @DecimalMin(value = "0.01")
    private BigDecimal price;

    @DecimalMin(value = "0.01")
    private BigDecimal mrp;

    private UUID categoryId;

    private ProductType productType;

    @Min(0)
    private Integer stock;

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
