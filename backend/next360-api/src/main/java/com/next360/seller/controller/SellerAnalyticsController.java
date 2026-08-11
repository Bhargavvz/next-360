package com.next360.seller.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.seller.dto.SellerAnalyticsResponse;
import com.next360.seller.service.SellerAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Seller analytics endpoints.
 */
@RestController
@RequestMapping("/api/v1/seller/analytics")
@PreAuthorize("hasRole('SELLER')")
public class SellerAnalyticsController {

    private final SellerAnalyticsService analyticsService;

    public SellerAnalyticsController(SellerAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SellerAnalyticsResponse>> getAnalytics() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var analytics = analyticsService.getAnalytics(userId);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
