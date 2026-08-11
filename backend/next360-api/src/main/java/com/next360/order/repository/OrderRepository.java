package com.next360.order.repository;

import com.next360.common.enums.OrderStatus;
import com.next360.order.entity.OrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {

    Optional<OrderEntity> findByOrderNumber(String orderNumber);

    Page<OrderEntity> findByUserId(UUID userId, Pageable pageable);

    Page<OrderEntity> findByUserIdAndStatus(UUID userId, OrderStatus status, Pageable pageable);

    long countByUserId(UUID userId);

    long countByStatus(OrderStatus status);
}
