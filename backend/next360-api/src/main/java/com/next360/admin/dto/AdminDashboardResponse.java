package com.next360.admin.dto;

import com.next360.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Comprehensive admin analytics dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    // Verification stats (from Phase 6)
    private long pendingCertificates;
    private long pendingKyc;
    private long pendingSellers;
    private long pendingProducts;

    // Sales stats
    private long totalOrders;
    private BigDecimal totalRevenue;
    private Map<OrderStatus, Long> ordersByStatus;

    // Inventory stats
    private long totalSellers;
    private long activeSellers;
    private long totalProducts;
    private long approvedProducts;

    // Review stats
    private long totalReviews;
    private long reportedReviews;
}
