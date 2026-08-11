package com.next360.product.repository;

import com.next360.common.enums.CertificateStatus;
import com.next360.product.entity.CertificateEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<CertificateEntity, UUID> {

    List<CertificateEntity> findByProductId(UUID productId);

    Optional<CertificateEntity> findByProductIdAndStatus(UUID productId, CertificateStatus status);

    List<CertificateEntity> findBySellerId(UUID sellerId);

    Page<CertificateEntity> findByStatus(CertificateStatus status, Pageable pageable);

    @Query("SELECT c FROM CertificateEntity c WHERE c.status = 'APPROVED' AND c.expiryDate <= :expiryBefore")
    List<CertificateEntity> findExpiringSoon(@Param("expiryBefore") LocalDate expiryBefore);
}
