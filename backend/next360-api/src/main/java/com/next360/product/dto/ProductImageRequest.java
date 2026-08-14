package com.next360.product.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Product image in create/update requests.
 */
@Data
public class ProductImageRequest {

    @NotBlank(message = "Image URL is required")
    @Size(max = 500)
    private String url;

    @Size(max = 200)
    private String altText;

    private int sortOrder = 0;
    @JsonProperty("isPrimary")
    private boolean primary = false;
}
