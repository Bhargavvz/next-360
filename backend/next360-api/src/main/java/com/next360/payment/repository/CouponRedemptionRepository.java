package com.next360.payment.repository;

import com.next360.payment.entity.CouponRedemptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemptionEntity, UUID> {

    long countByCouponIdAndUserId(UUID couponId, UUID userId);
}
