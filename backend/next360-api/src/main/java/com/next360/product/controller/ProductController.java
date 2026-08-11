package com.next360.product.controller;

import com.next360.common.dto.ApiResponse;
import com.next360.common.security.SecurityUtils;
import com.next360.product.dto.*;
import com.next360.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Product endpoints — public browsing + seller CRUD.
 */
@RestController
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ==================== Public Endpoints ====================

    /**
     * Search/list products with filters (public, no auth).
     */
    @GetMapping("/api/v1/products")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> searchProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String productType,
            @RequestParam(defaultValue = "false") boolean verifiedOnly,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        ProductSearchRequest request = new ProductSearchRequest();
        request.setQuery(query);
        request.setCategoryId(categoryId);
        if (productType != null) {
            request.setProductType(com.next360.common.enums.ProductType.valueOf(productType));
        }
        request.setVerifiedOnly(verifiedOnly);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setSortBy(sortBy);
        request.setSortDir(sortDir);
        request.setPage(page);
        request.setSize(Math.min(size, 50)); // cap at 50

        var results = productService.searchProducts(request);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * Get product detail by slug (public).
     */
    @GetMapping("/api/v1/products/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        var product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    /**
     * Get products by category (public).
     */
    @GetMapping("/api/v1/products/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getByCategory(
            @PathVariable UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        var results = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * QR Verification endpoint — look up product trust info by verification ID.
     */
    @GetMapping("/api/v1/verify/{verificationId}")
    public ResponseEntity<ApiResponse<ProductResponse>> verifyProduct(@PathVariable UUID verificationId) {
        var product = productService.getProductByVerificationId(verificationId);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    // ==================== Seller Endpoints ====================

    /**
     * Create a new product (seller only).
     */
    @PostMapping("/api/v1/seller/products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var product = productService.createProduct(userId, request);
        return ResponseEntity.ok(ApiResponse.success(product, "Product created"));
    }

    /**
     * List seller's own products (seller only).
     */
    @GetMapping("/api/v1/seller/products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getSellerProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        var results = productService.getSellerProducts(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * Update a product (seller only, ownership checked in service).
     */
    @PutMapping("/api/v1/seller/products/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        var product = productService.updateProduct(userId, productId, request);
        return ResponseEntity.ok(ApiResponse.success(product, "Product updated"));
    }

    /**
     * Soft-delete a product (seller only, sets DISCONTINUED).
     */
    @DeleteMapping("/api/v1/seller/products/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID productId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        productService.deleteProduct(userId, productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted"));
    }
}
