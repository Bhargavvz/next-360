package com.next360.seller.dto;

import com.next360.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Seller analytics dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerAnalyticsResponse {

    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalCommission;
    private BigDecimal netEarnings;
    private long totalProducts;
    private long approvedProducts;
    private BigDecimal averageRating;
    private long totalReviews;
    private Map<OrderStatus, Long> ordersByStatus;
}
