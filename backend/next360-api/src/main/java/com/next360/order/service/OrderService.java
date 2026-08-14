package com.next360.order.service;

import com.next360.common.enums.OrderStatus;
import com.next360.common.enums.PaymentMethod;
import com.next360.common.enums.PaymentStatus;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.config.ShippingProperties;
import com.next360.order.dto.*;
import com.next360.order.entity.*;
import com.next360.order.repository.*;
import com.next360.payment.service.CouponService;
import com.next360.product.entity.ProductEntity;
import com.next360.product.entity.ProductImageEntity;
import com.next360.product.entity.ProductVariantEntity;
import com.next360.product.repository.ProductRepository;
import com.next360.product.repository.ProductVariantRepository;
import com.next360.seller.entity.SellerEntity;
import com.next360.seller.repository.SellerRepository;
import com.next360.user.entity.AddressEntity;
import com.next360.user.entity.UserEntity;
import com.next360.user.repository.AddressRepository;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * Order management — place, track, cancel for buyers; fulfill for sellers.
 */
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CouponService couponService;
    private final ShippingProperties shippingProperties;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        SellerOrderRepository sellerOrderRepository,
                        CartItemRepository cartItemRepository,
                        AddressRepository addressRepository,
                        UserRepository userRepository,
                        SellerRepository sellerRepository,
                        ProductRepository productRepository,
                        ProductVariantRepository variantRepository,
                        CouponService couponService,
                        ShippingProperties shippingProperties) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.cartItemRepository = cartItemRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.couponService = couponService;
        this.shippingProperties = shippingProperties;
    }

    // ==================== Buyer Operations ====================

    /**
     * Place order from current cart. Creates order with items, splits into seller sub-orders.
     */
    @Transactional
    public OrderResponse placeOrder(UUID userId, PlaceOrderRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        AddressEntity address = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", request.getShippingAddressId().toString()));

        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Address does not belong to this user");
        }

        List<CartItemEntity> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        // Create order
        OrderEntity order = new OrderEntity();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setShippingAddress(address);
        order.setCouponCode(request.getCouponCode());
        order.setDeliveryNotes(request.getDeliveryNotes());
        order.setStatus(OrderStatus.PLACED);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod() == null
                ? PaymentMethod.RAZORPAY : request.getPaymentMethod());

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Group cart items by seller for sub-orders
        Map<UUID, List<CartItemEntity>> bySeller = new LinkedHashMap<>();

        for (CartItemEntity cartItem : cartItems) {
            ProductEntity product = cartItem.getProduct();
            reserveStock(cartItem);
            BigDecimal unitPrice = cartItem.getVariant() != null
                    ? cartItem.getVariant().getPrice() : product.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            String primaryImage = product.getImages().stream()
                    .filter(ProductImageEntity::isPrimary)
                    .findFirst()
                    .map(ProductImageEntity::getUrl)
                    .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

            OrderItemEntity item = new OrderItemEntity();
            item.setProduct(product);
            item.setVariant(cartItem.getVariant());
            item.setSeller(product.getSeller());
            item.setQuantity(cartItem.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setTotalPrice(itemTotal);
            item.setProductName(product.getName());
            item.setProductImageUrl(primaryImage);
            item.setVariantName(cartItem.getVariant() != null
                    ? cartItem.getVariant().getName() + ": " + cartItem.getVariant().getValue() : null);

            order.addItem(item);
            totalAmount = totalAmount.add(itemTotal);

            bySeller.computeIfAbsent(product.getSeller().getId(), k -> new ArrayList<>()).add(cartItem);
        }

        // Coupon and shipping are recomputed here from live data — never trusted from the
        // client, which only sends the code it wants applied. Validated now so an invalid
        // code fails before anything is written; consumed after the order id exists.
        boolean hasCoupon = request.getCouponCode() != null && !request.getCouponCode().isBlank();
        BigDecimal discount = hasCoupon
                ? couponService.validate(userId, request.getCouponCode(), totalAmount).getDiscountAmount()
                : BigDecimal.ZERO;
        BigDecimal shipping = shippingProperties.feeFor(totalAmount);
        BigDecimal finalAmount = totalAmount.subtract(discount).add(shipping);

        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discount);
        order.setShippingAmount(shipping);
        order.setFinalAmount(finalAmount);

        // Create seller sub-orders
        for (Map.Entry<UUID, List<CartItemEntity>> entry : bySeller.entrySet()) {
            SellerEntity seller = sellerRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Seller", entry.getKey().toString()));

            BigDecimal subtotal = entry.getValue().stream()
                    .map(ci -> {
                        BigDecimal up = ci.getVariant() != null ? ci.getVariant().getPrice() : ci.getProduct().getPrice();
                        return up.multiply(BigDecimal.valueOf(ci.getQuantity()));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal commPct = seller.getCommissionPercentage() != null
                    ? seller.getCommissionPercentage() : new BigDecimal("10.00");
            BigDecimal commAmt = subtotal.multiply(commPct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            SellerOrderEntity sellerOrder = new SellerOrderEntity();
            sellerOrder.setSeller(seller);
            sellerOrder.setStatus(OrderStatus.PLACED);
            sellerOrder.setSubtotal(subtotal);
            sellerOrder.setCommissionPercentage(commPct);
            sellerOrder.setCommissionAmount(commAmt);
            sellerOrder.setNetAmount(subtotal.subtract(commAmt));

            order.addSellerOrder(sellerOrder);
        }

        order = orderRepository.save(order);

        if (hasCoupon) {
            couponService.redeem(userId, request.getCouponCode(), totalAmount, order.getId());
        }

        // Clear cart
        cartItemRepository.deleteByUserId(userId);

        log.info("Order placed: {} ({}), subtotal={}, discount={}, shipping={}, payable={}",
                order.getOrderNumber(), order.getId(), totalAmount, discount, shipping, finalAmount);
        return mapToResponse(order);
    }

    /**
     * Decrement stock for a cart line at order time, re-checking availability first.
     * A product that sold out between adding to cart and checking out fails the whole
     * order rather than overselling.
     */
    private void reserveStock(CartItemEntity cartItem) {
        ProductEntity product = cartItem.getProduct();
        ProductVariantEntity variant = cartItem.getVariant();
        int quantity = cartItem.getQuantity();
        int available = variant != null ? variant.getStock() : product.getStock();

        if (available < quantity) {
            throw new IllegalStateException(available <= 0
                    ? product.getName() + " is out of stock"
                    : "Only " + available + " left of " + product.getName());
        }

        if (variant != null) {
            variant.setStock(available - quantity);
            variantRepository.save(variant);
        } else {
            product.setStock(available - quantity);
            productRepository.save(product);
        }
    }

    /**
     * Get order by ID (buyer).
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID userId, UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId.toString()));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }
        return mapToResponse(order);
    }

    /**
     * Get order by order number (buyer).
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(UUID userId, String orderNumber) {
        OrderEntity order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderNumber));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }
        return mapToResponse(order);
    }

    /**
     * List buyer's orders (paginated).
     */
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getMyOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::mapToListResponse);
    }

    /**
     * Cancel order (only if PLACED).
     */
    @Transactional
    public OrderResponse cancelOrder(UUID userId, UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId.toString()));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }
        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.PAYMENT_CONFIRMED) {
            throw new IllegalStateException("This order has already been processed and can no longer be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.getSellerOrders().forEach(so -> so.setStatus(OrderStatus.CANCELLED));
        // Put the reserved units back so the products become buyable again.
        order.getItems().forEach(this::releaseStock);
        order = orderRepository.save(order);

        log.info("Order cancelled: {}", order.getOrderNumber());
        return mapToResponse(order);
    }

    /** Return the units an order item reserved back to the product or variant. */
    private void releaseStock(OrderItemEntity item) {
        if (item.getVariant() != null) {
            ProductVariantEntity variant = item.getVariant();
            variant.setStock(variant.getStock() + item.getQuantity());
            variantRepository.save(variant);
        } else if (item.getProduct() != null) {
            ProductEntity product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }

    // ==================== Seller Operations ====================

    /**
     * Get seller's sub-orders (paginated).
     */
    @Transactional(readOnly = true)
    public Page<SellerOrderResponse> getSellerOrders(UUID userId, Pageable pageable) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));
        return sellerOrderRepository.findBySellerId(seller.getId(), pageable)
                .map(this::mapToSellerOrderResponse);
    }

    /**
     * Update seller order status (e.g., PROCESSING → PACKED → SHIPPED).
     */
    @Transactional
    public SellerOrderResponse updateSellerOrderStatus(UUID userId, UUID sellerOrderId, OrderStatus newStatus) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));

        SellerOrderEntity sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("SellerOrder", sellerOrderId.toString()));

        if (!sellerOrder.getSeller().getId().equals(seller.getId())) {
            throw new IllegalArgumentException("Seller order does not belong to this seller");
        }

        sellerOrder.setStatus(newStatus);
        if (newStatus == OrderStatus.SHIPPED) {
            sellerOrder.setShippedAt(Instant.now());
        } else if (newStatus == OrderStatus.DELIVERED) {
            sellerOrder.setDeliveredAt(Instant.now());
        }

        sellerOrder = sellerOrderRepository.save(sellerOrder);
        log.info("Seller order {} status → {}", sellerOrderId, newStatus);

        // Update parent order status if all seller orders have same status
        updateParentOrderStatus(sellerOrder.getOrder());

        return mapToSellerOrderResponse(sellerOrder);
    }

    /**
     * Add tracking info to seller order.
     */
    @Transactional
    public SellerOrderResponse addTracking(UUID userId, UUID sellerOrderId, UpdateShipmentRequest request) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));

        SellerOrderEntity sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("SellerOrder", sellerOrderId.toString()));

        if (!sellerOrder.getSeller().getId().equals(seller.getId())) {
            throw new IllegalArgumentException("Seller order does not belong to this seller");
        }

        sellerOrder.setTrackingNumber(request.getTrackingNumber());
        sellerOrder.setCourierName(request.getCourierName());
        sellerOrder.setStatus(OrderStatus.SHIPPED);
        sellerOrder.setShippedAt(Instant.now());

        sellerOrder = sellerOrderRepository.save(sellerOrder);
        log.info("Tracking added for seller order {}: {} ({})", sellerOrderId, request.getTrackingNumber(), request.getCourierName());

        updateParentOrderStatus(sellerOrder.getOrder());
        return mapToSellerOrderResponse(sellerOrder);
    }

    // ==================== Private Helpers ====================

    private void updateParentOrderStatus(OrderEntity order) {
        List<SellerOrderEntity> sellerOrders = order.getSellerOrders();
        if (sellerOrders.isEmpty()) return;

        boolean allDelivered = sellerOrders.stream().allMatch(so -> so.getStatus() == OrderStatus.DELIVERED);
        boolean allShipped = sellerOrders.stream().allMatch(so ->
                so.getStatus() == OrderStatus.SHIPPED || so.getStatus() == OrderStatus.DELIVERED);
        boolean allCancelled = sellerOrders.stream().allMatch(so -> so.getStatus() == OrderStatus.CANCELLED);

        if (allDelivered) {
            order.setStatus(OrderStatus.DELIVERED);
        } else if (allShipped) {
            order.setStatus(OrderStatus.SHIPPED);
        } else if (allCancelled) {
            order.setStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
    }

    private String generateOrderNumber() {
        long ts = System.currentTimeMillis() % 1_000_000_000;
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "N360-" + ts + "-" + rand;
    }

    private OrderResponse mapToResponse(OrderEntity order) {
        List<OrderResponse.OrderItemDto> items = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemDto.builder()
                        .id(item.getId())
                        .productName(item.getProductName())
                        .productImageUrl(item.getProductImageUrl())
                        .variantName(item.getVariantName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .productId(item.getProduct().getId())
                        .sellerId(item.getSeller().getId())
                        .sellerName(item.getSeller().getBusinessName())
                        .build())
                .toList();

        AddressEntity addr = order.getShippingAddress();
        OrderResponse.AddressDto addressDto = OrderResponse.AddressDto.builder()
                .name(addr.getName())
                .addressLine1(addr.getAddressLine1())
                .city(addr.getCity())
                .state(addr.getState())
                .pincode(addr.getPincode())
                .phone(addr.getPhone())
                .build();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .shippingAmount(order.getShippingAmount())
                .finalAmount(order.getFinalAmount())
                .couponCode(order.getCouponCode())
                .deliveryNotes(order.getDeliveryNotes())
                .items(items)
                .shippingAddress(addressDto)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderListResponse mapToListResponse(OrderEntity order) {
        var firstItem = order.getItems().isEmpty() ? null : order.getItems().get(0);
        return OrderListResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .finalAmount(order.getFinalAmount())
                .itemCount(order.getItems().size())
                .firstProductName(firstItem != null ? firstItem.getProductName() : null)
                .firstProductImage(firstItem != null ? firstItem.getProductImageUrl() : null)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private SellerOrderResponse mapToSellerOrderResponse(SellerOrderEntity sellerOrder) {
        OrderEntity order = sellerOrder.getOrder();
        UUID sellerId = sellerOrder.getSeller().getId();

        List<OrderResponse.OrderItemDto> items = order.getItems().stream()
                .filter(item -> item.getSeller().getId().equals(sellerId))
                .map(item -> OrderResponse.OrderItemDto.builder()
                        .id(item.getId())
                        .productName(item.getProductName())
                        .productImageUrl(item.getProductImageUrl())
                        .variantName(item.getVariantName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .productId(item.getProduct().getId())
                        .sellerId(sellerId)
                        .sellerName(sellerOrder.getSeller().getBusinessName())
                        .build())
                .toList();

        AddressEntity addr = order.getShippingAddress();
        OrderResponse.AddressDto addressDto = OrderResponse.AddressDto.builder()
                .name(addr.getName())
                .addressLine1(addr.getAddressLine1())
                .city(addr.getCity())
                .state(addr.getState())
                .pincode(addr.getPincode())
                .phone(addr.getPhone())
                .build();

        return SellerOrderResponse.builder()
                .id(sellerOrder.getId())
                .orderNumber(order.getOrderNumber())
                .status(sellerOrder.getStatus())
                .subtotal(sellerOrder.getSubtotal())
                .commissionAmount(sellerOrder.getCommissionAmount())
                .netAmount(sellerOrder.getNetAmount())
                .trackingNumber(sellerOrder.getTrackingNumber())
                .courierName(sellerOrder.getCourierName())
                .shippedAt(sellerOrder.getShippedAt())
                .deliveredAt(sellerOrder.getDeliveredAt())
                .items(items)
                .shippingAddress(addressDto)
                .buyerName(order.getUser().getName())
                .buyerPhone(order.getUser().getPhone())
                .createdAt(sellerOrder.getCreatedAt())
                .build();
    }
}
