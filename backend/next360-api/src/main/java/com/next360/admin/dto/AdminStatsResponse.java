package com.next360.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Admin dashboard summary stats.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long pendingCertificates;
    private long pendingKyc;
    private long pendingSellers;
    private long pendingProducts;
    private long totalSellers;
    private long totalProducts;
    private long approvedProducts;
}
