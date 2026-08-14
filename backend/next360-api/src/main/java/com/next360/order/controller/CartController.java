package com.next360.order.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.order.dto.AddToCartRequest;
import com.next360.order.dto.CartResponse;
import com.next360.order.service.CartService;
import com.next360.payment.dto.CouponResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Shopping cart endpoints.
 *
 * GET    /cart          → view cart
 * POST   /cart          → add item
 * PUT    /cart/{id}     → update quantity
 * DELETE /cart/{id}     → remove item
 * DELETE /cart          → clear cart
 */
@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var cart = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody AddToCartRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var cart = cartService.addToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item added to cart"));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @PathVariable UUID cartItemId,
            @RequestParam int quantity) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var cart = cartService.updateQuantity(userId, cartItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart updated"));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(@PathVariable UUID cartItemId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var cart = cartService.removeFromCart(userId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item removed"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        UUID userId = SecurityUtils.getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared"));
    }

    /** Request body for {@link #applyCoupon}. */
    @Data
    public static class ApplyCouponRequest {
        @NotBlank(message = "Coupon code is required")
        private String couponCode;
    }

    /**
     * Validate a coupon against the current cart and return the discount it yields.
     * Nothing is persisted — the code is re-checked when the order is placed.
     */
    @PostMapping("/coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var coupon = cartService.applyCoupon(userId, request.getCouponCode());
        return ResponseEntity.ok(ApiResponse.success(coupon, "Coupon applied"));
    }

    /**
     * Clearing a coupon is client-side state; this returns the plain cart so the
     * caller can refresh totals in one round trip.
     */
    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId), "Coupon removed"));
    }
}
