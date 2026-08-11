package com.next360.admin.controller;

import com.next360.admin.dto.AdminDashboardResponse;
import com.next360.admin.service.AdminDashboardService;
import com.next360.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin analytics dashboard.
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        var dashboard = dashboardService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
