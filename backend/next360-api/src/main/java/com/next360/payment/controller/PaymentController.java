package com.next360.payment.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.payment.dto.*;
import com.next360.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Payment endpoints.
 */
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initiate/{orderId}")
    public ResponseEntity<ApiResponse<PaymentInitResponse>> initiatePayment(@PathVariable UUID orderId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var response = paymentService.initiatePayment(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment initiated"));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var response = paymentService.verifyPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment confirmed"));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getOrderPayments(@PathVariable UUID orderId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var payments = paymentService.getOrderPayments(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
}
