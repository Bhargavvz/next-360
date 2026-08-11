package com.next360.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Product rating summary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingSummaryResponse {

    private BigDecimal averageRating;
    private long totalReviews;
    private Map<Integer, Long> distribution; // 1→count, 2→count, ...5→count
}
