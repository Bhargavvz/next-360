package com.next360.review.entity;

import com.next360.common.entity.BaseEntity;
import com.next360.product.entity.ProductEntity;
import com.next360.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Product review by a verified buyer.
 * Only users who have purchased a product can leave reviews.
 */
@Entity
@Table(name = "reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"product_id", "user_id", "order_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ReviewEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "order_id", nullable = false)
    private java.util.UUID orderId;

    @Column(name = "rating", nullable = false)
    private int rating;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "comment", nullable = false, columnDefinition = "TEXT")
    private String comment;

    /** Stored as JSONB array of image URLs */
    @Column(name = "images", columnDefinition = "JSONB")
    private String images;

    @Column(name = "is_verified_purchase", nullable = false)
    private boolean isVerifiedPurchase = true;

    @Column(name = "seller_response", columnDefinition = "TEXT")
    private String sellerResponse;

    @Column(name = "seller_responded_at")
    private Instant sellerRespondedAt;

    @Column(name = "helpful_count", nullable = false)
    private int helpfulCount = 0;

    @Column(name = "is_reported", nullable = false)
    private boolean isReported = false;
}
