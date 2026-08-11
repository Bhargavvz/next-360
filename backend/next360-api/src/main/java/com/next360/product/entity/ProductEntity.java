package com.next360.product.entity;

import com.next360.common.entity.BaseEntity;
import com.next360.common.enums.ProductStatus;
import com.next360.common.enums.ProductType;
import com.next360.seller.entity.SellerEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Product listing. The core marketplace entity.
 *
 * Trust rule: isVerifiedOrganic is computed server-side based on:
 * productType == ORGANIC && certificate.status == APPROVED && seller.status == APPROVED && status == APPROVED
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class ProductEntity extends BaseEntity {

    @Column(name = "slug", nullable = false, unique = true, length = 250)
    private String slug;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "mrp", precision = 12, scale = 2)
    private BigDecimal mrp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private SellerEntity seller;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 20)
    private ProductType productType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProductStatus status = ProductStatus.DRAFT;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount = 0;

    @Column(name = "stock", nullable = false)
    private int stock = 0;

    @Column(name = "sku", length = 50)
    private String sku;

    @Column(name = "weight", length = 50)
    private String weight;

    @Column(name = "dimensions", length = 100)
    private String dimensions;

    @Column(name = "ingredients", columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "nutritional_info", columnDefinition = "TEXT")
    private String nutritionalInfo;

    @Column(name = "origin", length = 200)
    private String origin;

    @Column(name = "storage_instructions", length = 500)
    private String storageInstructions;

    @Column(name = "is_verified_organic", nullable = false)
    private boolean isVerifiedOrganic = false;

    /** Unique verification ID for QR code scanning */
    @Column(name = "verification_id", unique = true)
    private UUID verificationId = UUID.randomUUID();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private List<ProductImageEntity> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductVariantEntity> variants = new ArrayList<>();

    public void addImage(ProductImageEntity image) {
        images.add(image);
        image.setProduct(this);
    }

    public void addVariant(ProductVariantEntity variant) {
        variants.add(variant);
        variant.setProduct(this);
    }
}
