package com.next360.order.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.order.dto.WishlistItemResponse;
import com.next360.order.service.WishlistService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Wishlist endpoints.
 *
 * GET    /wishlist               → list wishlist items
 * POST   /wishlist/{productId}   → add to wishlist
 * DELETE /wishlist/{productId}   → remove from wishlist
 * GET    /wishlist/{productId}/check → check if in wishlist
 */
@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<WishlistItemResponse>>> getWishlist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "addedAt"));
        var wishlist = wishlistService.getWishlist(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(wishlist));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> addToWishlist(@PathVariable UUID productId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var item = wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.success(item, "Added to wishlist"));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable UUID productId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Removed from wishlist"));
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkWishlist(@PathVariable UUID productId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        boolean inWishlist = wishlistService.isInWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("inWishlist", inWishlist)));
    }
}
