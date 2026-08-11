package com.next360.order.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.order.dto.*;
import com.next360.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Buyer order endpoints.
 */
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var order = orderService.placeOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success(order, "Order placed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        var orders = orderService.getMyOrders(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID orderId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var order = orderService.getOrder(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(@PathVariable String orderNumber) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var order = orderService.getOrderByNumber(userId, orderNumber);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable UUID orderId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var order = orderService.cancelOrder(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Order cancelled"));
    }
}
