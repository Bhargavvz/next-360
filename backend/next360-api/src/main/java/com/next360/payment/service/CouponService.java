package com.next360.payment.service;

import com.next360.common.enums.CouponType;
import com.next360.payment.dto.CouponResponse;
import com.next360.payment.entity.CouponEntity;
import com.next360.payment.entity.CouponRedemptionEntity;
import com.next360.payment.repository.CouponRedemptionRepository;
import com.next360.payment.repository.CouponRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

/**
 * Coupon validation and redemption.
 *
 * <p>Discounts are always recomputed server-side from the live cart subtotal — a code
 * the client "applied" earlier is re-validated at order placement, so a stale or tampered
 * discount can never reach the order total.
 */
@Service
public class CouponService {

    private static final Logger log = LoggerFactory.getLogger(CouponService.class);

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository redemptionRepository;

    public CouponService(CouponRepository couponRepository,
                         CouponRedemptionRepository redemptionRepository) {
        this.couponRepository = couponRepository;
        this.redemptionRepository = redemptionRepository;
    }

    /**
     * Validate a code against a subtotal and return the discount it yields.
     *
     * @throws IllegalArgumentException with a user-facing reason when the code cannot be used
     */
    @Transactional(readOnly = true)
    public CouponResponse validate(UUID userId, String code, BigDecimal subtotal) {
        CouponEntity coupon = requireUsableCoupon(userId, code, subtotal);
        BigDecimal discount = computeDiscount(coupon, subtotal);

        return CouponResponse.builder()
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .discountAmount(discount)
                .subtotal(subtotal)
                .payableAmount(subtotal.subtract(discount))
                .expiresAt(coupon.getExpiresAt())
                .build();
    }

    /**
     * Validate and consume a coupon for an order. Increments the global usage counter
     * and records the redemption so per-user limits hold on the next attempt.
     *
     * @return the discount applied, or {@link BigDecimal#ZERO} when no code was supplied
     */
    @Transactional
    public BigDecimal redeem(UUID userId, String code, BigDecimal subtotal, UUID orderId) {
        if (code == null || code.isBlank()) {
            return BigDecimal.ZERO;
        }

        CouponEntity coupon = requireUsableCoupon(userId, code, subtotal);
        BigDecimal discount = computeDiscount(coupon, subtotal);

        coupon.setUsageCount(coupon.getUsageCount() + 1);
        couponRepository.save(coupon);

        CouponRedemptionEntity redemption = new CouponRedemptionEntity();
        redemption.setCouponId(coupon.getId());
        redemption.setUserId(userId);
        redemption.setOrderId(orderId);
        redemption.setCode(coupon.getCode());
        redemption.setDiscountAmount(discount);
        redemptionRepository.save(redemption);

        log.info("Coupon {} redeemed by user {} for ₹{}", coupon.getCode(), userId, discount);
        return discount;
    }

    // ---- Internals ----

    private CouponEntity requireUsableCoupon(UUID userId, String code, BigDecimal subtotal) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Enter a coupon code");
        }

        String normalized = code.trim().toUpperCase(Locale.ROOT);
        CouponEntity coupon = couponRepository.findByCodeAndIsActiveTrue(normalized)
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));

        Instant now = Instant.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new IllegalArgumentException("This coupon is not active yet");
        }
        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            throw new IllegalArgumentException("This coupon has expired");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new IllegalArgumentException("This coupon has been fully redeemed");
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new IllegalArgumentException(
                    "Add ₹" + coupon.getMinOrderAmount().subtract(subtotal).setScale(2, RoundingMode.HALF_UP)
                            .toPlainString() + " more to use this coupon");
        }
        if (coupon.getPerUserLimit() != null) {
            long used = redemptionRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (used >= coupon.getPerUserLimit()) {
                throw new IllegalArgumentException("You have already used this coupon");
            }
        }

        return coupon;
    }

    /** Percentage coupons honour {@code maxDiscountAmount}; nothing ever exceeds the subtotal. */
    private BigDecimal computeDiscount(CouponEntity coupon, BigDecimal subtotal) {
        BigDecimal discount = coupon.getType() == CouponType.PERCENTAGE
                ? subtotal.multiply(coupon.getValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
                : coupon.getValue();

        if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }
}
