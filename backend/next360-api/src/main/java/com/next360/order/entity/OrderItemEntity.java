package com.next360.order.entity;

import com.next360.product.entity.ProductEntity;
import com.next360.product.entity.ProductVariantEntity;
import com.next360.seller.entity.SellerEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Individual line item within an order.
 * Product name and image are denormalized (snapshot at time of purchase).
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariantEntity variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private SellerEntity seller;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    /** Denormalized snapshot — preserves product name at time of purchase */
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    /** Denormalized snapshot — preserves product image at time of purchase */
    @Column(name = "product_image_url", length = 500)
    private String productImageUrl;

    @Column(name = "variant_name", length = 100)
    private String variantName;
}
