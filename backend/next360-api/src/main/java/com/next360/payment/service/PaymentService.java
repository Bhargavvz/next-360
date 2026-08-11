package com.next360.payment.service;

import com.next360.common.enums.OrderStatus;
import com.next360.common.enums.PaymentStatus;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.order.entity.OrderEntity;
import com.next360.order.repository.OrderRepository;
import com.next360.payment.dto.*;
import com.next360.payment.entity.PaymentEntity;
import com.next360.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Payment service — gateway integration (mock in dev, Razorpay in prod).
 * In dev mode, payment is auto-confirmed.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Initiate payment for an order. In dev mode, generates mock gateway IDs.
     */
    @Transactional
    public PaymentInitResponse initiatePayment(UUID userId, UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId.toString()));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }

        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Payment already completed for this order");
        }

        // Generate mock gateway order ID (in prod, call Razorpay API)
        String gatewayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setAmount(order.getFinalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod("RAZORPAY");
        payment.setGatewayOrderId(gatewayOrderId);

        payment = paymentRepository.save(payment);

        log.info("Payment initiated for order {}: {}", order.getOrderNumber(), payment.getId());

        return PaymentInitResponse.builder()
                .paymentId(payment.getId())
                .gatewayOrderId(gatewayOrderId)
                .amount(order.getFinalAmount())
                .currency("INR")
                .keyId("rzp_test_mock_key")
                .build();
    }

    /**
     * Verify and confirm payment. In dev mode, auto-confirms.
     */
    @Transactional
    public PaymentResponse verifyPayment(UUID userId, PaymentVerifyRequest request) {
        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId().toString()));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }

        PaymentEntity payment = paymentRepository.findByGatewayOrderId(request.getGatewayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.getGatewayOrderId()));

        // In production: verify signature with Razorpay
        // In dev: auto-confirm
        payment.setGatewayPaymentId(request.getGatewayPaymentId());
        payment.setGatewaySignature(request.getGatewaySignature());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(Instant.now());

        payment = paymentRepository.save(payment);

        // Update order payment status
        order.setPaymentStatus(PaymentStatus.COMPLETED);
        order.setStatus(OrderStatus.PAYMENT_CONFIRMED);
        orderRepository.save(order);

        log.info("Payment confirmed for order {}: gateway={}", order.getOrderNumber(), request.getGatewayPaymentId());

        return mapToResponse(payment);
    }

    /**
     * Get payments for an order.
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getOrderPayments(UUID userId, UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId.toString()));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }

        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PaymentResponse mapToResponse(PaymentEntity payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .gatewayOrderId(payment.getGatewayOrderId())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
