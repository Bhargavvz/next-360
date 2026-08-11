package com.next360.order.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.order.dto.AddToCartRequest;
import com.next360.order.dto.CartResponse;
import com.next360.order.service.CartService;
import jakarta.validation.Valid;
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
}
