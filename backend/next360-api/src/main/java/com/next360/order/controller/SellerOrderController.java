package com.next360.order.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.enums.OrderStatus;
import com.next360.common.security.SecurityUtils;
import com.next360.order.dto.SellerOrderResponse;
import com.next360.order.dto.UpdateShipmentRequest;
import com.next360.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Seller order fulfillment endpoints.
 */
@RestController
@RequestMapping("/api/v1/seller/orders")
@PreAuthorize("hasRole('SELLER')")
public class SellerOrderController {

    private final OrderService orderService;

    public SellerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SellerOrderResponse>>> getSellerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        var orders = orderService.getSellerOrders(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PostMapping("/{sellerOrderId}/status")
    public ResponseEntity<ApiResponse<SellerOrderResponse>> updateStatus(
            @PathVariable UUID sellerOrderId,
            @RequestParam OrderStatus status) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var order = orderService.updateSellerOrderStatus(userId, sellerOrderId, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Status updated to " + status));
    }

    @PostMapping("/{sellerOrderId}/ship")
    public ResponseEntity<ApiResponse<SellerOrderResponse>> addTracking(
            @PathVariable UUID sellerOrderId,
            @Valid @RequestBody UpdateShipmentRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var order = orderService.addTracking(userId, sellerOrderId, request);
        return ResponseEntity.ok(ApiResponse.success(order, "Shipment tracking added"));
    }
}
