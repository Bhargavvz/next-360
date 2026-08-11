package com.next360.review.repository;

import com.next360.review.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, UUID> {

    Page<ReviewEntity> findByProductId(UUID productId, Pageable pageable);

    Page<ReviewEntity> findByUserId(UUID userId, Pageable pageable);

    boolean existsByProductIdAndUserIdAndOrderId(UUID productId, UUID userId, UUID orderId);

    @Query("SELECT AVG(r.rating) FROM ReviewEntity r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") UUID productId);

    @Query("SELECT COUNT(r) FROM ReviewEntity r WHERE r.product.id = :productId AND r.rating = :rating")
    long countByProductIdAndRating(@Param("productId") UUID productId, @Param("rating") int rating);

    long countByProductId(UUID productId);
}
