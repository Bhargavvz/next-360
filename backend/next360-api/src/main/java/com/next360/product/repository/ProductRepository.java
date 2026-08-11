package com.next360.product.repository;

import com.next360.common.enums.ProductStatus;
import com.next360.common.enums.ProductType;
import com.next360.product.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {

    Optional<ProductEntity> findBySlug(String slug);

    Optional<ProductEntity> findByVerificationId(UUID verificationId);

    boolean existsBySlug(String slug);

    Page<ProductEntity> findBySellerId(UUID sellerId, Pageable pageable);

    Page<ProductEntity> findByCategoryId(UUID categoryId, Pageable pageable);

    Page<ProductEntity> findByStatus(ProductStatus status, Pageable pageable);

    Page<ProductEntity> findByProductTypeAndStatus(ProductType type, ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM ProductEntity p WHERE p.status = 'APPROVED' " +
           "AND (:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:productType IS NULL OR p.productType = :productType) " +
           "AND (:verifiedOnly = FALSE OR p.isVerifiedOrganic = TRUE) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<ProductEntity> searchProducts(
            @Param("query") String query,
            @Param("categoryId") UUID categoryId,
            @Param("productType") ProductType productType,
            @Param("verifiedOnly") boolean verifiedOnly,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            Pageable pageable
    );

    long countBySellerIdAndStatus(UUID sellerId, ProductStatus status);

    Page<ProductEntity> findByIsVerifiedOrganicTrueAndStatus(ProductStatus status, Pageable pageable);

    Page<ProductEntity> findByCategoryIdAndStatus(UUID categoryId, ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM ProductEntity p WHERE p.status = 'APPROVED' AND " +
           "(LOWER(p.name) LIKE %:keyword% OR LOWER(p.description) LIKE %:keyword%)")
    Page<ProductEntity> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
