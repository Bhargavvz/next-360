package com.next360.review.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Review response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private UUID id;
    private UUID productId;
    private String productName;
    private int rating;
    private String title;
    private String comment;
    private List<String> images;
    @JsonProperty("isVerifiedPurchase")
    private boolean verifiedPurchase;
    private int helpfulCount;
    private String reviewerName;
    private String sellerResponse;
    private Instant sellerRespondedAt;
    private Instant createdAt;
}
