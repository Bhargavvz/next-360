package com.next360.review.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.review.dto.*;
import com.next360.review.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Review & rating endpoints.
 */
@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // ==================== Public ====================

    @GetMapping("/api/v1/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        var reviews = reviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/api/v1/products/{productId}/ratings")
    public ResponseEntity<ApiResponse<RatingSummaryResponse>> getRatingSummary(@PathVariable UUID productId) {
        var summary = reviewService.getRatingSummary(productId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    // ==================== Authenticated ====================

    @PostMapping("/api/v1/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody CreateReviewRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var review = reviewService.createReview(userId, request);
        return ResponseEntity.ok(ApiResponse.success(review, "Review submitted"));
    }

    @PostMapping("/api/v1/reviews/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<Void>> markHelpful(@PathVariable UUID reviewId) {
        reviewService.markHelpful(reviewId);
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as helpful"));
    }

    // ==================== Seller ====================

    @PostMapping("/api/v1/seller/reviews/{reviewId}/respond")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> addSellerResponse(
            @PathVariable UUID reviewId,
            @RequestBody Map<String, String> body) {
        var review = reviewService.addSellerResponse(reviewId, body.get("response"));
        return ResponseEntity.ok(ApiResponse.success(review, "Response added"));
    }
}
