package com.next360.review.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.product.entity.ProductEntity;
import com.next360.product.repository.ProductRepository;
import com.next360.review.dto.*;
import com.next360.review.entity.ReviewEntity;
import com.next360.review.repository.ReviewRepository;
import com.next360.user.entity.UserEntity;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

/**
 * Review & rating service with product rating aggregation.
 */
@Service
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a review (one per product per order per user).
     */
    @Transactional
    public ReviewResponse createReview(UUID userId, CreateReviewRequest request) {
        if (reviewRepository.existsByProductIdAndUserIdAndOrderId(request.getProductId(), userId, request.getOrderId())) {
            throw new IllegalStateException("You have already reviewed this product for this order");
        }

        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId().toString()));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        ReviewEntity review = new ReviewEntity();
        review.setProduct(product);
        review.setUser(user);
        review.setOrderId(request.getOrderId());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setVerifiedPurchase(true);

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                review.setImages(objectMapper.writeValueAsString(request.getImages()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize review images", e);
            }
        }

        review = reviewRepository.save(review);

        // Update product rating
        updateProductRating(product.getId());

        log.info("Review created for product {}: rating={}", product.getId(), request.getRating());
        return mapToResponse(review);
    }

    /**
     * Get reviews for a product (public).
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(UUID productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get rating summary for a product (public).
     */
    @Transactional(readOnly = true)
    public RatingSummaryResponse getRatingSummary(UUID productId) {
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        long total = reviewRepository.countByProductId(productId);

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            distribution.put(i, reviewRepository.countByProductIdAndRating(productId, i));
        }

        return RatingSummaryResponse.builder()
                .averageRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : null)
                .totalReviews(total)
                .distribution(distribution)
                .build();
    }

    /**
     * Seller responds to a review.
     */
    @Transactional
    public ReviewResponse addSellerResponse(UUID reviewId, String response) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId.toString()));

        review.setSellerResponse(response);
        review.setSellerRespondedAt(Instant.now());
        review = reviewRepository.save(review);

        log.info("Seller response added to review {}", reviewId);
        return mapToResponse(review);
    }

    /**
     * Mark review as helpful.
     */
    @Transactional
    public void markHelpful(UUID reviewId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId.toString()));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
    }

    private void updateProductRating(UUID productId) {
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);

        ProductEntity product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : null);
            product.setReviewCount((int) count);
            productRepository.save(product);
        }
    }

    @SuppressWarnings("unchecked")
    private ReviewResponse mapToResponse(ReviewEntity review) {
        List<String> images = List.of();
        if (review.getImages() != null) {
            try {
                images = objectMapper.readValue(review.getImages(), List.class);
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse review images", e);
            }
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .images(images)
                .isVerifiedPurchase(review.isVerifiedPurchase())
                .helpfulCount(review.getHelpfulCount())
                .reviewerName(review.getUser().getName() != null ? review.getUser().getName() : "Anonymous")
                .sellerResponse(review.getSellerResponse())
                .sellerRespondedAt(review.getSellerRespondedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
