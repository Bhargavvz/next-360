package com.next360.payment.service;

import com.next360.common.enums.OrderStatus;
import com.next360.common.enums.PaymentMethod;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment orchestration for Razorpay and cash-on-delivery.
 *
 * <p>Online flow: {@link #initiatePayment} creates (or reuses) a PENDING payment and a
 * Razorpay order, the client completes checkout, then either {@link #verifyPayment}
 * (client callback, HMAC-verified) or {@link #handleWebhook} (server-to-server, also
 * HMAC-verified) marks it COMPLETED. Both paths are idempotent, so whichever arrives
 * first wins and the second is a no-op.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private static final BigDecimal PAISE_MULTIPLIER = new BigDecimal("100");

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final boolean codEnabled;
    private final BigDecimal codMaxOrderAmount;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          @Autowired(required = false) RazorpayClient razorpayClient,
                          RazorpayConfig razorpayConfig,
                          @Value("${next360.payment.cod-enabled:true}") boolean codEnabled,
                          @Value("${next360.payment.cod-max-order-amount:20000}") BigDecimal codMaxOrderAmount) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
        this.razorpayConfig = razorpayConfig;
        this.codEnabled = codEnabled;
        this.codMaxOrderAmount = codMaxOrderAmount;
    }

    // ==================== Initiation ====================

    /**
     * Start payment for an order.
     *
     * <p>Re-initiating an order that already has a usable PENDING Razorpay order returns
     * the same gateway order instead of creating a duplicate, so a user who reloads the
     * checkout page does not leave orphaned gateway orders behind.
     */
    @Transactional
    public PaymentInitResponse initiatePayment(UUID userId, UUID orderId, PaymentMethod method) {
        OrderEntity order = loadOwnedOrder(userId, orderId);

        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Payment already completed for this order");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("This order has been cancelled");
        }

        PaymentMethod resolved = method == null ? PaymentMethod.RAZORPAY : method;
        return resolved == PaymentMethod.COD
                ? initiateCod(order)
                : initiateOnline(order);
    }

    private PaymentInitResponse initiateCod(OrderEntity order) {
        if (!codEnabled) {
            throw new IllegalStateException("Cash on delivery is not available right now");
        }
        if (order.getFinalAmount().compareTo(codMaxOrderAmount) > 0) {
            throw new IllegalStateException(
                    "Cash on delivery is only available for orders up to ₹" + codMaxOrderAmount.toPlainString());
        }

        // Any half-finished online attempt is abandoned when the user switches to COD.
        paymentRepository.findByOrderId(order.getId()).stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .forEach(p -> {
                    p.setStatus(PaymentStatus.FAILED);
                    p.setFailureReason("Superseded by cash on delivery");
                    paymentRepository.save(p);
                });

        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setAmount(order.getFinalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod(PaymentMethod.COD.name());
        payment.setGatewayReceipt(order.getOrderNumber());
        payment = paymentRepository.save(payment);

        order.setPaymentMethod(PaymentMethod.COD);
        // COD orders are confirmed immediately; the money is collected on delivery.
        order.setStatus(OrderStatus.PAYMENT_CONFIRMED);
        orderRepository.save(order);

        log.info("COD selected for order {}", order.getOrderNumber());

        return baseResponse(order, payment)
                .method(PaymentMethod.COD)
                .build();
    }

    private PaymentInitResponse initiateOnline(OrderEntity order) {
        long amountInPaise = toPaise(order.getFinalAmount());

        Optional<PaymentEntity> reusable = paymentRepository.findByOrderId(order.getId()).stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .filter(p -> PaymentMethod.RAZORPAY.name().equals(p.getPaymentMethod()))
                .filter(p -> p.getGatewayOrderId() != null)
                .filter(p -> p.getAmount().compareTo(order.getFinalAmount()) == 0)
                .findFirst();

        if (reusable.isPresent()) {
            PaymentEntity payment = reusable.get();
            log.info("Reusing pending Razorpay order {} for order {}",
                    payment.getGatewayOrderId(), order.getOrderNumber());
            return onlineResponse(order, payment, amountInPaise);
        }

        String gatewayOrderId;
        boolean mock = razorpayClient == null;

        if (mock) {
            gatewayOrderId = "order_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            log.warn("Razorpay is not configured — issuing mock gateway order {} for {}",
                    gatewayOrderId, order.getOrderNumber());
        } else {
            try {
                JSONObject request = new JSONObject();
                request.put("amount", amountInPaise);
                request.put("currency", razorpayConfig.getCurrency());
                request.put("receipt", order.getOrderNumber());
                request.put("payment_capture", 1);

                Order razorpayOrder = razorpayClient.orders.create(request);
                gatewayOrderId = razorpayOrder.get("id");
                log.info("Razorpay order {} created for {}", gatewayOrderId, order.getOrderNumber());
            } catch (RazorpayException e) {
                log.error("Razorpay order creation failed for {}", order.getOrderNumber(), e);
                throw new IllegalStateException("Payment gateway is unavailable. Please try again.");
            }
        }

        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setAmount(order.getFinalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod(PaymentMethod.RAZORPAY.name());
        payment.setGatewayOrderId(gatewayOrderId);
        payment.setGatewayReceipt(order.getOrderNumber());
        payment = paymentRepository.save(payment);

        order.setPaymentMethod(PaymentMethod.RAZORPAY);
        orderRepository.save(order);

        return onlineResponse(order, payment, amountInPaise);
    }

    // ==================== Verification ====================

    /**
     * Verify a checkout callback and mark the payment complete.
     *
     * <p>The HMAC is computed over {@code order_id|payment_id} using the Razorpay
     * <em>key secret</em>. Without a configured secret the signature cannot be trusted,
     * so verification is only skipped in explicit mock mode.
     */
    @Transactional
    public PaymentResponse verifyPayment(UUID userId, PaymentVerifyRequest request) {
        OrderEntity order = loadOwnedOrder(userId, request.getOrderId());

        PaymentEntity payment = paymentRepository.findByGatewayOrderId(request.getGatewayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.getGatewayOrderId()));

        if (!payment.getOrder().getId().equals(order.getId())) {
            throw new IllegalArgumentException("Payment does not belong to this order");
        }

        // Idempotent: a webhook may have confirmed this already.
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            return mapToResponse(payment);
        }

        if (razorpayConfig.isConfigured()) {
            verifySignature(request, order.getOrderNumber());
        } else {
            log.warn("Razorpay not configured — accepting unverified payment for {} (mock mode)",
                    order.getOrderNumber());
        }

        markPaid(payment, request.getGatewayPaymentId(), request.getGatewaySignature());
        log.info("Payment confirmed for order {} (gateway payment {})",
                order.getOrderNumber(), request.getGatewayPaymentId());

        return mapToResponse(payment);
    }

    private void verifySignature(PaymentVerifyRequest request, String orderNumber) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getGatewayOrderId());
            attributes.put("razorpay_payment_id", request.getGatewayPaymentId());
            attributes.put("razorpay_signature", request.getGatewaySignature());

            // NOTE: this must be the key SECRET, not the key id.
            boolean valid = Utils.verifyPaymentSignature(attributes, razorpayConfig.getKeySecret());
            if (!valid) {
                log.warn("Razorpay signature verification FAILED for order {}", orderNumber);
                throw new IllegalArgumentException("Payment verification failed — invalid signature");
            }
        } catch (RazorpayException e) {
            log.error("Razorpay signature verification error for order {}", orderNumber, e);
            throw new IllegalArgumentException("Payment verification failed");
        }
    }

    /**
     * Handle a Razorpay webhook. This is the authoritative confirmation path: it still
     * lands even if the buyer closes the browser right after paying.
     *
     * @param rawBody   the exact request body bytes as received (required for HMAC)
     * @param signature value of the {@code X-Razorpay-Signature} header
     */
    @Transactional
    public void handleWebhook(String rawBody, String signature) {
        if (!razorpayConfig.isConfigured()) {
            log.warn("Webhook received but Razorpay is not configured — ignoring");
            return;
        }

        try {
            if (!Utils.verifyWebhookSignature(rawBody, signature, razorpayConfig.getWebhookSecret())) {
                log.warn("Webhook signature verification failed — rejecting");
                throw new IllegalArgumentException("Invalid webhook signature");
            }
        } catch (RazorpayException e) {
            log.error("Webhook signature verification error", e);
            throw new IllegalArgumentException("Invalid webhook signature");
        }

        JSONObject payload = new JSONObject(rawBody);
        String event = payload.optString("event");
        JSONObject entity = null;

        JSONObject payloadNode = payload.optJSONObject("payload");
        if (payloadNode != null) {
            JSONObject paymentNode = payloadNode.optJSONObject("payment");
            if (paymentNode != null) {
                entity = paymentNode.optJSONObject("entity");
            }
        }

        if (entity == null) {
            log.info("Webhook event {} carries no payment entity — ignoring", event);
            return;
        }

        String gatewayPaymentId = entity.optString("id", null);
        String gatewayOrderId = entity.optString("order_id", null);

        PaymentEntity payment = (gatewayOrderId != null
                ? paymentRepository.findByGatewayOrderId(gatewayOrderId)
                : Optional.<PaymentEntity>empty())
                .or(() -> gatewayPaymentId != null
                        ? paymentRepository.findByGatewayPaymentId(gatewayPaymentId)
                        : Optional.empty())
                .orElse(null);

        if (payment == null) {
            log.warn("Webhook {} referenced unknown payment (order={}, payment={})",
                    event, gatewayOrderId, gatewayPaymentId);
            return;
        }

        switch (event) {
            case "payment.captured", "order.paid" -> {
                if (payment.getStatus() != PaymentStatus.COMPLETED) {
                    markPaid(payment, gatewayPaymentId, null);
                    log.info("Webhook {} confirmed payment for order {}",
                            event, payment.getOrder().getOrderNumber());
                }
            }
            case "payment.failed" -> {
                if (payment.getStatus() == PaymentStatus.PENDING) {
                    String reason = entity.optString("error_description", "Payment failed at gateway");
                    markFailed(payment, gatewayPaymentId, reason);
                    log.info("Webhook payment.failed for order {}: {}",
                            payment.getOrder().getOrderNumber(), reason);
                }
            }
            default -> log.debug("Ignoring unhandled webhook event: {}", event);
        }
    }

    /**
     * Record a client-reported failure or dismissal so the order does not sit in
     * limbo. Never trusted for success — only for marking a PENDING payment failed.
     */
    @Transactional
    public PaymentResponse markPaymentFailed(UUID userId, PaymentFailureRequest request) {
        OrderEntity order = loadOwnedOrder(userId, request.getOrderId());

        PaymentEntity payment = (request.getGatewayOrderId() != null
                ? paymentRepository.findByGatewayOrderId(request.getGatewayOrderId())
                : Optional.<PaymentEntity>empty())
                .orElseGet(() -> paymentRepository.findByOrderId(order.getId()).stream()
                        .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Payment", order.getId().toString())));

        if (!payment.getOrder().getId().equals(order.getId())) {
            throw new IllegalArgumentException("Payment does not belong to this order");
        }

        // A webhook may already have captured it — never downgrade a completed payment.
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            return mapToResponse(payment);
        }

        String reason = request.getReason() == null || request.getReason().isBlank()
                ? "Payment cancelled or failed at gateway"
                : request.getReason();
        markFailed(payment, request.getGatewayPaymentId(), reason);

        return mapToResponse(payment);
    }

    // ==================== Queries ====================

    @Transactional(readOnly = true)
    public List<PaymentResponse> getOrderPayments(UUID userId, UUID orderId) {
        loadOwnedOrder(userId, orderId);
        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /** Payment methods currently offered, so the client does not show a dead option. */
    public List<PaymentMethod> availableMethods(BigDecimal orderAmount) {
        if (codEnabled && orderAmount != null && orderAmount.compareTo(codMaxOrderAmount) <= 0) {
            return List.of(PaymentMethod.RAZORPAY, PaymentMethod.COD);
        }
        return List.of(PaymentMethod.RAZORPAY);
    }

    // ==================== Helpers ====================

    private void markPaid(PaymentEntity payment, String gatewayPaymentId, String signature) {
        if (gatewayPaymentId != null) {
            payment.setGatewayPaymentId(gatewayPaymentId);
        }
        if (signature != null) {
            payment.setGatewaySignature(signature);
        }
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setFailureReason(null);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        OrderEntity order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.COMPLETED);
        if (order.getStatus() == OrderStatus.PLACED) {
            order.setStatus(OrderStatus.PAYMENT_CONFIRMED);
        }
        orderRepository.save(order);
    }

    private void markFailed(PaymentEntity payment, String gatewayPaymentId, String reason) {
        if (gatewayPaymentId != null) {
            payment.setGatewayPaymentId(gatewayPaymentId);
        }
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        paymentRepository.save(payment);

        OrderEntity order = payment.getOrder();
        // Leave the order PLACED so the buyer can retry; only the payment is failed.
        order.setPaymentStatus(PaymentStatus.FAILED);
        orderRepository.save(order);
    }

    private OrderEntity loadOwnedOrder(UUID userId, UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId.toString()));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }
        return order;
    }

    /**
     * Convert rupees to paise without losing sub-rupee precision.
     * {@code BigDecimal.intValue()} truncates, so ₹149.75 would have been charged as ₹1.
     */
    private static long toPaise(BigDecimal rupees) {
        return rupees.multiply(PAISE_MULTIPLIER).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private PaymentInitResponse onlineResponse(OrderEntity order, PaymentEntity payment, long amountInPaise) {
        var user = order.getUser();
        return baseResponse(order, payment)
                .method(PaymentMethod.RAZORPAY)
                .gatewayOrderId(payment.getGatewayOrderId())
                .amountInPaise(amountInPaise)
                .keyId(razorpayConfig.isConfigured() ? razorpayConfig.getKeyId() : null)
                .mock(razorpayClient == null)
                .customerName(user.getName())
                .customerPhone(user.getPhone())
                .customerEmail(user.getEmail())
                .build();
    }

    private PaymentInitResponse.PaymentInitResponseBuilder baseResponse(OrderEntity order, PaymentEntity payment) {
        return PaymentInitResponse.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(payment.getStatus())
                .amount(order.getFinalAmount())
                .amountInPaise(toPaise(order.getFinalAmount()))
                .currency(razorpayConfig.getCurrency());
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
                .failureReason(payment.getFailureReason())
                .refundedAmount(payment.getRefundedAmount())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
