package com.next360.payment.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.enums.PaymentMethod;
import com.next360.common.security.SecurityUtils;
import com.next360.payment.dto.*;
import com.next360.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Payment endpoints.
 *
 * <pre>
 * POST /payments/initiate/{orderId}  → create/reuse a gateway order (or select COD)
 * POST /payments/verify              → confirm a checkout callback (HMAC verified)
 * POST /payments/failed              → record a failed/dismissed checkout
 * POST /payments/webhook             → Razorpay server-to-server callback (public)
 * GET  /payments/order/{orderId}     → payment history for an order
 * </pre>
 */
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initiate/{orderId}")
    public ResponseEntity<ApiResponse<PaymentInitResponse>> initiatePayment(
            @PathVariable UUID orderId,
            @RequestBody(required = false) PaymentInitRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PaymentMethod method = request == null ? PaymentMethod.RAZORPAY : request.getMethod();
        var response = paymentService.initiatePayment(userId, orderId, method);
        String message = response.getMethod() == PaymentMethod.COD
                ? "Order confirmed — pay on delivery"
                : "Payment initiated";
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var response = paymentService.verifyPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment confirmed"));
    }

    /**
     * Records a checkout that failed or was dismissed. Cannot mark anything as paid.
     */
    @PostMapping("/failed")
    public ResponseEntity<ApiResponse<PaymentResponse>> markFailed(
            @Valid @RequestBody PaymentFailureRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var response = paymentService.markPaymentFailed(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment marked as failed"));
    }

    /**
     * Razorpay webhook. Unauthenticated by design — trust comes from the HMAC
     * signature over the raw body, which the service verifies before doing anything.
     */
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> webhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        if (signature == null || signature.isBlank()) {
            log.warn("Webhook received without a signature header — rejecting");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("BAD_REQUEST", "Missing signature"));
        }
        paymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok(ApiResponse.success(null, "Webhook processed"));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getOrderPayments(@PathVariable UUID orderId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var payments = paymentService.getOrderPayments(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
}
