package com.next360.order.service;

import com.next360.common.exception.ResourceNotFoundException;
import com.next360.order.dto.*;
import com.next360.order.entity.CartItemEntity;
import com.next360.order.repository.CartItemRepository;
import com.next360.product.entity.ProductEntity;
import com.next360.product.entity.ProductImageEntity;
import com.next360.product.entity.ProductVariantEntity;
import com.next360.product.repository.ProductRepository;
import com.next360.product.repository.ProductVariantRepository;
import com.next360.user.entity.UserEntity;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Cart management service. Prices are always computed from live product data.
 */
@Service
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       ProductVariantRepository variantRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    /**
     * Add item to cart (or increase quantity if already exists).
     */
    @Transactional
    public CartResponse addToCart(UUID userId, AddToCartRequest request) {
        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId().toString()));

        ProductVariantEntity variant = null;
        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant", request.getVariantId().toString()));
        }

        // Check if already in cart
        var existingOpt = request.getVariantId() != null
                ? cartItemRepository.findByUserIdAndProductIdAndVariantId(userId, request.getProductId(), request.getVariantId())
                : cartItemRepository.findByUserIdAndProductIdAndVariantIdIsNull(userId, request.getProductId());

        if (existingOpt.isPresent()) {
            CartItemEntity existing = existingOpt.get();
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
            cartItemRepository.save(existing);
            log.info("Cart item updated: userId={}, productId={}, qty={}", userId, request.getProductId(), existing.getQuantity());
        } else {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
            CartItemEntity item = new CartItemEntity();
            item.setUser(user);
            item.setProduct(product);
            item.setVariant(variant);
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
            log.info("Cart item added: userId={}, productId={}", userId, request.getProductId());
        }

        return getCart(userId);
    }

    /**
     * Get the full cart with live prices.
     */
    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        List<CartItemEntity> items = cartItemRepository.findByUserId(userId);

        List<CartItemResponse> itemResponses = items.stream()
                .map(this::mapToCartItemResponse)
                .toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalMrp = itemResponses.stream()
                .map(i -> (i.getUnitMrp() != null ? i.getUnitMrp() : i.getUnitPrice())
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(itemResponses)
                .itemCount(itemResponses.size())
                .subtotal(subtotal)
                .totalMrp(totalMrp)
                .discount(totalMrp.subtract(subtotal))
                .build();
    }

    /**
     * Update cart item quantity.
     */
    @Transactional
    public CartResponse updateQuantity(UUID userId, UUID cartItemId, int quantity) {
        CartItemEntity item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", cartItemId.toString()));

        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cart item does not belong to this user");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            log.info("Cart item removed: {}", cartItemId);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
            log.info("Cart item quantity updated: {} -> {}", cartItemId, quantity);
        }

        return getCart(userId);
    }

    /**
     * Remove a specific item from cart.
     */
    @Transactional
    public CartResponse removeFromCart(UUID userId, UUID cartItemId) {
        CartItemEntity item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", cartItemId.toString()));

        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cart item does not belong to this user");
        }

        cartItemRepository.delete(item);
        log.info("Cart item removed: {}", cartItemId);
        return getCart(userId);
    }

    /**
     * Clear entire cart.
     */
    @Transactional
    public void clearCart(UUID userId) {
        cartItemRepository.deleteByUserId(userId);
        log.info("Cart cleared for user: {}", userId);
    }

    private CartItemResponse mapToCartItemResponse(CartItemEntity item) {
        ProductEntity product = item.getProduct();
        ProductVariantEntity variant = item.getVariant();

        BigDecimal unitPrice = variant != null ? variant.getPrice() : product.getPrice();
        BigDecimal unitMrp = variant != null ? variant.getMrp() : product.getMrp();
        int stock = variant != null ? variant.getStock() : product.getStock();

        String primaryImage = product.getImages().stream()
                .filter(ProductImageEntity::isPrimary)
                .findFirst()
                .map(ProductImageEntity::getUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .productImageUrl(primaryImage)
                .variantId(variant != null ? variant.getId() : null)
                .variantName(variant != null ? variant.getName() : null)
                .variantValue(variant != null ? variant.getValue() : null)
                .quantity(item.getQuantity())
                .unitPrice(unitPrice)
                .unitMrp(unitMrp)
                .lineTotal(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                .availableStock(stock)
                .inStock(stock > 0)
                .addedAt(item.getAddedAt())
                .build();
    }
}
