package com.next360.order.service;

import com.next360.common.exception.ResourceNotFoundException;
import com.next360.order.dto.WishlistItemResponse;
import com.next360.product.entity.ProductEntity;
import com.next360.product.entity.ProductImageEntity;
import com.next360.product.repository.ProductRepository;
import com.next360.review.entity.WishlistEntity;
import com.next360.review.repository.WishlistRepository;
import com.next360.user.entity.UserEntity;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Wishlist management service.
 */
@Service
public class WishlistService {

    private static final Logger log = LoggerFactory.getLogger(WishlistService.class);

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * Add product to wishlist (idempotent — no error if already exists).
     */
    @Transactional
    public WishlistItemResponse addToWishlist(UUID userId, UUID productId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        var existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        WishlistEntity wishlist = new WishlistEntity();
        wishlist.setUser(user);
        wishlist.setProduct(product);

        wishlist = wishlistRepository.save(wishlist);
        log.info("Wishlist item added: userId={}, productId={}", userId, productId);
        return mapToResponse(wishlist);
    }

    /**
     * Remove product from wishlist.
     */
    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("Wishlist item removed: userId={}, productId={}", userId, productId);
    }

    /**
     * Get user's wishlist (paginated).
     */
    @Transactional(readOnly = true)
    public Page<WishlistItemResponse> getWishlist(UUID userId, Pageable pageable) {
        return wishlistRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Check if product is in wishlist.
     */
    @Transactional(readOnly = true)
    public boolean isInWishlist(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private WishlistItemResponse mapToResponse(WishlistEntity wishlist) {
        ProductEntity product = wishlist.getProduct();

        String primaryImage = product.getImages().stream()
                .filter(ProductImageEntity::isPrimary)
                .findFirst()
                .map(ProductImageEntity::getUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

        return WishlistItemResponse.builder()
                .id(wishlist.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .productImageUrl(primaryImage)
                .price(product.getPrice())
                .mrp(product.getMrp())
                .inStock(product.getStock() > 0)
                .verifiedOrganic(product.isVerifiedOrganic())
                .addedAt(wishlist.getAddedAt())
                .build();
    }
}
