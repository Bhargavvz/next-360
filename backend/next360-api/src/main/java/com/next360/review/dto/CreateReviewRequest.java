package com.next360.review.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Create a product review.
 */
@Data
public class CreateReviewRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Order ID is required")
    private UUID orderId;

    @Min(value = 1, message = "Rating must be 1-5")
    @Max(value = 5, message = "Rating must be 1-5")
    private int rating;

    @Size(max = 200)
    private String title;

    @NotBlank(message = "Comment is required")
    @Size(max = 5000)
    private String comment;

    private List<String> images;
}
