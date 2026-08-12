package com.next360.payment.service;

import com.next360.common.enums.OrderStatus;
import com.next360.common.enums.PaymentStatus;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.config.RazorpayConfig;
import com.next360.order.entity.OrderEntity;
import com.next360.order.repository.OrderRepository;
import com.next360.payment.dto.*;
import com.next360.payment.entity.PaymentEntity;
import com.next360.payment.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          @Autowired(required = false) RazorpayClient razorpayClient,
                          RazorpayConfig razorpayConfig) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
        this.razorpayConfig = razorpayConfig;
    }

    /**
     * Initiate payment for an order.
     * Creates a real Razorpay order if configured, otherwise falls back to mock.
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

        String gatewayOrderId;
        String keyId;

        if (razorpayClient != null) {
            // Real Razorpay integration
            try {
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", order.getFinalAmount().multiply(new java.math.BigDecimal(100)).intValue()); // Razorpay uses paise
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", order.getOrderNumber());
                orderRequest.put("payment_capture", 1); // Auto-capture

                Order razorpayOrder = razorpayClient.orders.create(orderRequest);
                gatewayOrderId = razorpayOrder.get("id");
                keyId = razorpayConfig.getKeyId();

                log.info("Razorpay order created: {} for order {}", gatewayOrderId, order.getOrderNumber());
            } catch (RazorpayException e) {
                log.error("Razorpay order creation failed for order {}", order.getOrderNumber(), e);
                throw new RuntimeException("Payment gateway error: " + e.getMessage());
            }
        } else {
            // Mock mode fallback
            gatewayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            keyId = "rzp_test_mock_key";
            log.info("Mock payment initiated for order {}: {}", order.getOrderNumber(), gatewayOrderId);
        }

        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setAmount(order.getFinalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod("RAZORPAY");
        payment.setGatewayOrderId(gatewayOrderId);

        payment = paymentRepository.save(payment);

        return PaymentInitResponse.builder()
                .paymentId(payment.getId())
                .gatewayOrderId(gatewayOrderId)
                .amount(order.getFinalAmount())
                .currency("INR")
                .keyId(keyId)
                .build();
    }

    /**
     * Verify and confirm payment using Razorpay signature verification.
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

        // Verify Razorpay signature
        if (razorpayClient != null) {
            try {
                JSONObject attributes = new JSONObject();
                attributes.put("razorpay_order_id", request.getGatewayOrderId());
                attributes.put("razorpay_payment_id", request.getGatewayPaymentId());
                attributes.put("razorpay_signature", request.getGatewaySignature());

                boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayConfig.getKeyId());
                if (!isValid) {
                    log.warn("Razorpay signature verification failed for order {}", order.getOrderNumber());
                    throw new IllegalArgumentException("Payment verification failed — invalid signature");
                }
            } catch (RazorpayException e) {
                log.error("Razorpay verification error for order {}", order.getOrderNumber(), e);
                throw new RuntimeException("Payment verification error: " + e.getMessage());
            }
        }

        // Mark payment as completed
        payment.setGatewayPaymentId(request.getGatewayPaymentId());
        payment.setGatewaySignature(request.getGatewaySignature());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(Instant.now());
        payment = paymentRepository.save(payment);

        // Update order status
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
