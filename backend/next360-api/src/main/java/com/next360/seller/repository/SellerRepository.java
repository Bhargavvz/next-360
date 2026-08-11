package com.next360.seller.repository;

import com.next360.common.enums.SellerStatus;
import com.next360.seller.entity.SellerEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SellerRepository extends JpaRepository<SellerEntity, UUID> {

    Optional<SellerEntity> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Page<SellerEntity> findByStatus(SellerStatus status, Pageable pageable);

    long countByStatus(SellerStatus status);
}
