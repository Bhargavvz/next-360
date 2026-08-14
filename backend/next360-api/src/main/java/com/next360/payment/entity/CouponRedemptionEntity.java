package com.next360.payment.entity;

import com.next360.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * One row per successful coupon use. Backs the per-user usage limit and gives
 * finance an audit trail of what each discount cost.
 */
@Entity
@Table(name = "coupon_redemptions")
@Getter
@Setter
@NoArgsConstructor
public class CouponRedemptionEntity extends BaseEntity {

    @Column(name = "coupon_id", nullable = false)
    private UUID couponId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount;
}
