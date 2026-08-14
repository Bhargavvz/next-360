package com.next360.product.service;

import com.next360.common.enums.ProductStatus;
import com.next360.common.enums.ProductType;
import com.next360.product.dto.ProductCardResponse;
import com.next360.product.entity.ProductEntity;
import com.next360.product.entity.ProductImageEntity;
import com.next360.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Search and discovery service.
 * Branches on filter combinations in Java to avoid null parameter JPQL type issues.
 */
@Service
public class SearchService {

    private final ProductRepository productRepository;

    public SearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Search APPROVED products with optional keyword, category, verifiedOrganic filters.
     */
    @Transactional(readOnly = true)
    public Page<ProductCardResponse> searchProducts(String query, UUID categoryId, Boolean verifiedOrganic,
                                                    String sortBy, Pageable pageable) {

        boolean hasQuery = query != null && !query.isBlank();
        boolean hasCategory = categoryId != null;
        boolean verified = Boolean.TRUE.equals(verifiedOrganic);

        Page<ProductEntity> products;

        if (hasQuery) {
            // Keyword search — always APPROVED (built into query)
            products = productRepository.searchByKeyword(query.toLowerCase().trim(), pageable);
        } else if (verified && hasCategory) {
            products = productRepository.findByIsVerifiedOrganicTrueAndStatus(ProductStatus.APPROVED, pageable);
        } else if (verified) {
            products = productRepository.findByIsVerifiedOrganicTrueAndStatus(ProductStatus.APPROVED, pageable);
        } else if (hasCategory) {
            products = productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.APPROVED, pageable);
        } else {
            products = productRepository.findByStatus(ProductStatus.APPROVED, pageable);
        }

        return products.map(this::mapToCard);
    }

    /**
     * Get trending / top-rated approved products.
     */
    @Transactional(readOnly = true)
    public Page<ProductCardResponse> getTrending(Pageable pageable) {
        return productRepository.findByStatus(ProductStatus.APPROVED, pageable)
                .map(this::mapToCard);
    }

    /**
     * Get NPOP verified organic products.
     */
    @Transactional(readOnly = true)
    public Page<ProductCardResponse> getVerifiedOrganic(Pageable pageable) {
        return productRepository.findByIsVerifiedOrganicTrueAndStatus(ProductStatus.APPROVED, pageable)
                .map(this::mapToCard);
    }

    private ProductCardResponse mapToCard(ProductEntity product) {
        String primaryImage = product.getImages().stream()
                .filter(ProductImageEntity::isPrimary)
                .findFirst()
                .map(ProductImageEntity::getUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

        return ProductCardResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .imageUrl(primaryImage)
                .price(product.getPrice())
                .mrp(product.getMrp())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .verifiedOrganic(product.isVerifiedOrganic())
                .sellerName(product.getSeller().getBusinessName())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .inStock(product.getStock() > 0)
                .productType(product.getProductType())
                .build();
    }
}
