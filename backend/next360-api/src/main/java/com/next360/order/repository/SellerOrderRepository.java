package com.next360.order.repository;

import com.next360.common.enums.OrderStatus;
import com.next360.order.entity.SellerOrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SellerOrderRepository extends JpaRepository<SellerOrderEntity, UUID> {

    List<SellerOrderEntity> findByOrderId(UUID orderId);

    Page<SellerOrderEntity> findBySellerId(UUID sellerId, Pageable pageable);

    Page<SellerOrderEntity> findBySellerIdAndStatus(UUID sellerId, OrderStatus status, Pageable pageable);

    long countBySellerIdAndStatus(UUID sellerId, OrderStatus status);
}
