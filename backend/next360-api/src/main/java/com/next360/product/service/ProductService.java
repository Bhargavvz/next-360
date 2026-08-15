package com.next360.product.service;

import com.next360.common.enums.ProductStatus;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.product.dto.*;
import com.next360.product.entity.*;
import com.next360.product.repository.*;
import com.next360.seller.entity.SellerEntity;
import com.next360.seller.repository.SellerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;

/**
 * Product CRUD, search, and verification service.
 */
@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          SellerRepository sellerRepository,
                          ProductImageRepository productImageRepository,
                          ProductVariantRepository productVariantRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.sellerRepository = sellerRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
    }

    // ==================== Seller CRUD ====================

    @Transactional
    public ProductResponse createProduct(UUID userId, CreateProductRequest request) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId().toString()));

        ProductEntity product = new ProductEntity();
        product.setName(request.getName());
        product.setSlug(generateSlug(request.getName()));
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMrp(request.getMrp());
        product.setCategory(category);
        product.setSeller(seller);
        product.setProductType(request.getProductType());
        product.setStock(request.getStock());
        product.setSku(request.getSku());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setIngredients(request.getIngredients());
        product.setNutritionalInfo(request.getNutritionalInfo());
        product.setOrigin(request.getOrigin());
        product.setStorageInstructions(request.getStorageInstructions());
        product.setStatus(ProductStatus.PENDING);

        product = productRepository.save(product);

        // Add images
        if (request.getImages() != null) {
            for (ProductImageRequest img : request.getImages()) {
                ProductImageEntity image = new ProductImageEntity();
                image.setUrl(img.getUrl());
                image.setAltText(img.getAltText());
                image.setSortOrder(img.getSortOrder());
                image.setPrimary(img.isPrimary());
                product.addImage(image);
            }
        }

        // Add variants
        if (request.getVariants() != null) {
            for (ProductVariantRequest v : request.getVariants()) {
                ProductVariantEntity variant = new ProductVariantEntity();
                variant.setName(v.getName());
                variant.setValue(v.getValue());
                variant.setPrice(v.getPrice());
                variant.setMrp(v.getMrp());
                variant.setStock(v.getStock());
                variant.setSku(v.getSku());
                variant.setWeight(v.getWeight());
                product.addVariant(variant);
            }
        }

        product = productRepository.save(product);
        log.info("Product created: {} ({})", product.getName(), product.getId());
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID userId, UUID productId, UpdateProductRequest request) {
        ProductEntity product = findProductWithOwnership(userId, productId);

        if (request.getName() != null) {
            product.setName(request.getName());
            product.setSlug(generateSlug(request.getName()));
        }
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getMrp() != null) product.setMrp(request.getMrp());
        if (request.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId().toString()));
            product.setCategory(category);
        }
        if (request.getProductType() != null) product.setProductType(request.getProductType());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getSku() != null) product.setSku(request.getSku());
        if (request.getWeight() != null) product.setWeight(request.getWeight());
        if (request.getDimensions() != null) product.setDimensions(request.getDimensions());
        if (request.getIngredients() != null) product.setIngredients(request.getIngredients());
        if (request.getNutritionalInfo() != null) product.setNutritionalInfo(request.getNutritionalInfo());
        if (request.getOrigin() != null) product.setOrigin(request.getOrigin());
        if (request.getStorageInstructions() != null) product.setStorageInstructions(request.getStorageInstructions());

        // Replace images if provided
        if (request.getImages() != null) {
            product.getImages().clear();
            for (ProductImageRequest img : request.getImages()) {
                ProductImageEntity image = new ProductImageEntity();
                image.setUrl(img.getUrl());
                image.setAltText(img.getAltText());
                image.setSortOrder(img.getSortOrder());
                image.setPrimary(img.isPrimary());
                product.addImage(image);
            }
        }

        // Replace variants if provided
        if (request.getVariants() != null) {
            product.getVariants().clear();
            for (ProductVariantRequest v : request.getVariants()) {
                ProductVariantEntity variant = new ProductVariantEntity();
                variant.setName(v.getName());
                variant.setValue(v.getValue());
                variant.setPrice(v.getPrice());
                variant.setMrp(v.getMrp());
                variant.setStock(v.getStock());
                variant.setSku(v.getSku());
                variant.setWeight(v.getWeight());
                product.addVariant(variant);
            }
        }

        product = productRepository.save(product);
        log.info("Product updated: {}", productId);
        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(UUID userId, UUID productId) {
        ProductEntity product = findProductWithOwnership(userId, productId);
        product.setStatus(ProductStatus.DISCONTINUED);
        productRepository.save(product);
        log.info("Product soft-deleted: {}", productId);
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> getSellerProducts(UUID userId, Pageable pageable) {
        SellerEntity seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", "userId=" + userId));
        return productRepository.findBySellerId(seller.getId(), pageable)
                .map(this::mapToListResponse);
    }

    // ==================== Public Browsing ====================

    @Transactional(readOnly = true)
    /**
     * Resolve a product by slug or by UUID.
     *
     * <p>The web links by slug (better for SEO) while the app links by id, and
     * this single route serves both. Accepting only slugs meant every product
     * tap in the app 404'd.
     */
    public ProductResponse getProductBySlugOrId(String slugOrId) {
        var bySlug = productRepository.findBySlug(slugOrId);
        if (bySlug.isPresent()) {
            return mapToResponse(bySlug.get());
        }

        // Not a slug — if it parses as a UUID, try the id.
        try {
            UUID id = UUID.fromString(slugOrId);
            return productRepository.findById(id)
                    .map(this::mapToResponse)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", slugOrId));
        } catch (IllegalArgumentException notAUuid) {
            throw new ResourceNotFoundException("Product", slugOrId);
        }
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id.toString()));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> searchProducts(ProductSearchRequest request) {
        Sort sort = Sort.by(
                "asc".equalsIgnoreCase(request.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC,
                mapSortField(request.getSortBy())
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        return productRepository.searchProducts(
                toLikePattern(request.getQuery()),
                request.getCategoryId(),
                request.getProductType(),
                request.isVerifiedOnly(),
                request.getMinPrice(),
                request.getMaxPrice(),
                pageable
        ).map(this::mapToListResponse);
    }

    /**
     * Turn an optional search term into a LIKE pattern, escaping the wildcards a user
     * might type so "50% off" does not match everything. A blank term becomes "%".
     */
    private static String toLikePattern(String query) {
        if (query == null || query.isBlank()) {
            return "%";
        }
        String escaped = query.trim()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> getProductsByCategory(UUID categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable)
                .map(this::mapToListResponse);
    }

    /**
     * QR Verification — look up product by verification ID.
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductByVerificationId(UUID verificationId) {
        ProductEntity product = productRepository.findByVerificationId(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "verificationId=" + verificationId));
        return mapToResponse(product);
    }

    // ==================== Private Helpers ====================

    private ProductEntity findProductWithOwnership(UUID userId, UUID productId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString()));

        if (!product.getSeller().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Product does not belong to this seller");
        }
        return product;
    }

    private String generateSlug(String name) {
        String slug = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        // Ensure uniqueness
        String baseSlug = slug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private String mapSortField(String sortBy) {
        return switch (sortBy) {
            case "price" -> "price";
            case "rating" -> "rating";
            case "name" -> "name";
            default -> "createdAt";
        };
    }

    private ProductResponse mapToResponse(ProductEntity product) {
        List<ProductResponse.ImageDto> images = product.getImages().stream()
                .map(img -> ProductResponse.ImageDto.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .altText(img.getAltText())
                        .sortOrder(img.getSortOrder())
                        .primary(img.isPrimary())
                        .build())
                .toList();

        List<ProductResponse.VariantDto> variants = product.getVariants().stream()
                .map(v -> ProductResponse.VariantDto.builder()
                        .id(v.getId())
                        .name(v.getName())
                        .value(v.getValue())
                        .price(v.getPrice())
                        .mrp(v.getMrp())
                        .stock(v.getStock())
                        .sku(v.getSku())
                        .weight(v.getWeight())
                        .build())
                .toList();

        return ProductResponse.builder()
                .id(product.getId())
                .slug(product.getSlug())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .mrp(product.getMrp())
                .productType(product.getProductType())
                .status(product.getStatus())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .stock(product.getStock())
                .sku(product.getSku())
                .weight(product.getWeight())
                .dimensions(product.getDimensions())
                .ingredients(product.getIngredients())
                .nutritionalInfo(product.getNutritionalInfo())
                .origin(product.getOrigin())
                .storageInstructions(product.getStorageInstructions())
                .verifiedOrganic(product.isVerifiedOrganic())
                .verificationId(product.getVerificationId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .categorySlug(product.getCategory().getSlug())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getBusinessName())
                .sellerLogoUrl(product.getSeller().getLogoUrl())
                .images(images)
                .variants(variants)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private ProductListResponse mapToListResponse(ProductEntity product) {
        String primaryImage = product.getImages().stream()
                .filter(ProductImageEntity::isPrimary)
                .findFirst()
                .map(ProductImageEntity::getUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

        return ProductListResponse.builder()
                .id(product.getId())
                .slug(product.getSlug())
                .name(product.getName())
                .price(product.getPrice())
                .mrp(product.getMrp())
                .primaryImageUrl(primaryImage)
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .productType(product.getProductType())
                .verifiedOrganic(product.isVerifiedOrganic())
                .stock(product.getStock())
                .sellerName(product.getSeller().getBusinessName())
                .sellerId(product.getSeller().getId())
                .categoryName(product.getCategory().getName())
                .status(product.getStatus())
                .build();
    }
}
