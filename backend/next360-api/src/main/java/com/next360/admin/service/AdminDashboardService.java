package com.next360.admin.service;

import com.next360.admin.dto.AdminDashboardResponse;
import com.next360.common.enums.*;
import com.next360.order.repository.OrderRepository;
import com.next360.payment.repository.PaymentRepository;
import com.next360.product.repository.CertificateRepository;
import com.next360.product.repository.ProductRepository;
import com.next360.review.repository.ReviewRepository;
import com.next360.seller.repository.SellerKycRepository;
import com.next360.seller.repository.SellerRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Admin dashboard analytics service.
 */
@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final CertificateRepository certificateRepository;
    private final SellerKycRepository kycRepository;
    private final ReviewRepository reviewRepository;

    public AdminDashboardService(OrderRepository orderRepository,
                                  ProductRepository productRepository,
                                  SellerRepository sellerRepository,
                                  CertificateRepository certificateRepository,
                                  SellerKycRepository kycRepository,
                                  ReviewRepository reviewRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
        this.certificateRepository = certificateRepository;
        this.kycRepository = kycRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        // Order stats
        Map<OrderStatus, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, orderRepository.countByStatus(status));
        }
        long totalOrders = orderRepository.count();

        return AdminDashboardResponse.builder()
                // Verification
                .pendingCertificates(certificateRepository.findByStatus(CertificateStatus.PENDING, Pageable.unpaged()).getTotalElements())
                .pendingKyc(kycRepository.countByStatus(KycStatus.PENDING))
                .pendingSellers(sellerRepository.countByStatus(SellerStatus.PENDING))
                .pendingProducts(productRepository.findByStatus(ProductStatus.PENDING, Pageable.unpaged()).getTotalElements())
                // Sales
                .totalOrders(totalOrders)
                .totalRevenue(BigDecimal.ZERO) // TODO: aggregate from payments
                .ordersByStatus(ordersByStatus)
                // Inventory
                .totalSellers(sellerRepository.count())
                .activeSellers(sellerRepository.countByStatus(SellerStatus.APPROVED))
                .totalProducts(productRepository.count())
                .approvedProducts(productRepository.findByStatus(ProductStatus.APPROVED, Pageable.unpaged()).getTotalElements())
                // Reviews
                .totalReviews(reviewRepository.count())
                .reportedReviews(0) // TODO: count reported reviews
                .build();
    }
}
