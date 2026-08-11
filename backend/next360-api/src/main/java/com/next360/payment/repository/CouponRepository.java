package com.next360.payment.repository;

import com.next360.payment.entity.CouponEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<CouponEntity, UUID> {

    Optional<CouponEntity> findByCode(String code);

    Optional<CouponEntity> findByCodeAndIsActiveTrue(String code);

    boolean existsByCode(String code);
}
