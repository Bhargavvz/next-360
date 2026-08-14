package com.next360.payment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.next360.common.enums.CouponType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * A validated coupon and the discount it produces for the caller's current cart.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CouponResponse {

    private String code;
    private String description;
    private CouponType type;
    private BigDecimal value;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;

    /** Rupees taken off the current cart subtotal. */
    private BigDecimal discountAmount;

    /** Cart subtotal the discount was computed against. */
    private BigDecimal subtotal;

    /** Payable after the discount (shipping excluded). */
    private BigDecimal payableAmount;

    private Instant expiresAt;
}
