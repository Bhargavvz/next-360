package com.next360.order.repository;

import com.next360.order.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, UUID> {

    List<CartItemEntity> findByUserId(UUID userId);

    Optional<CartItemEntity> findByUserIdAndProductIdAndVariantId(UUID userId, UUID productId, UUID variantId);

    Optional<CartItemEntity> findByUserIdAndProductIdAndVariantIdIsNull(UUID userId, UUID productId);

    void deleteByUserId(UUID userId);

    long countByUserId(UUID userId);
}
