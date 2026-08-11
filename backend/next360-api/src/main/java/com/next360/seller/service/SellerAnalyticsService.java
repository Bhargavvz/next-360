package com.next360.seller.service;

import com.next360.common.enums.OrderStatus;
import com.next360.common.enums.ProductStatus;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.order.entity.SellerOrderEntity;
import com.next360.order.repository.SellerOrderRepository;
import com.next360.product.repository.ProductRepository;
import com.next360.seller.dto.SellerAnalyticsResponse;
import com.next360.seller.entity.SellerEntity;
import com.next360.seller.repository.SellerRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Seller analytics service.
 */
@Service
public class SellerAnalyticsService {

    private final SellerRepository sellerRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final ProductRepository productRepository;

    public SellerAnalyticsService(SellerRepository sellerRepository,
                                   SellerOrderRepository sellerOrderRepository,
                                   ProductRepository productRepository) {
        this.sellerRepository = sellerRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public SellerAnalyticsResponse getAnalytics(UUID userId) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));

        UUID sellerId = seller.getId();

        // Order stats
        Map<OrderStatus, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, sellerOrderRepository.countBySellerIdAndStatus(sellerId, status));
        }

        long totalOrders = sellerOrderRepository.findBySellerId(sellerId, Pageable.unpaged()).getTotalElements();
        long pendingOrders = sellerOrderRepository.countBySellerIdAndStatus(sellerId, OrderStatus.PLACED)
                + sellerOrderRepository.countBySellerIdAndStatus(sellerId, OrderStatus.PROCESSING);
        long completedOrders = sellerOrderRepository.countBySellerIdAndStatus(sellerId, OrderStatus.DELIVERED);

        // Revenue
        BigDecimal totalRevenue = sellerOrderRepository.findBySellerId(sellerId, Pageable.unpaged())
                .stream()
                .map(SellerOrderEntity::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCommission = sellerOrderRepository.findBySellerId(sellerId, Pageable.unpaged())
                .stream()
                .map(SellerOrderEntity::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Products
        long totalProducts = productRepository.findBySellerId(sellerId, Pageable.unpaged()).getTotalElements();
        long approvedProducts = productRepository.countBySellerIdAndStatus(sellerId, ProductStatus.APPROVED);

        return SellerAnalyticsResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .totalRevenue(totalRevenue)
                .totalCommission(totalCommission)
                .netEarnings(totalRevenue.subtract(totalCommission))
                .totalProducts(totalProducts)
                .approvedProducts(approvedProducts)
                .averageRating(seller.getRating())
                .totalReviews(0) // aggregated in future
                .ordersByStatus(ordersByStatus)
                .build();
    }
}
