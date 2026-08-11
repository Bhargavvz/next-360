package com.next360.seller.repository;

import com.next360.common.enums.KycStatus;
import com.next360.seller.entity.SellerKycEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SellerKycRepository extends JpaRepository<SellerKycEntity, UUID> {

    List<SellerKycEntity> findBySellerId(UUID sellerId);

    List<SellerKycEntity> findBySellerIdAndStatus(UUID sellerId, KycStatus status);

    long countByStatus(KycStatus status);
}
