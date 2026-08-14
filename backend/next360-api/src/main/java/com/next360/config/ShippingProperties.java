package com.next360.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Delivery pricing (prefix {@code next360.shipping}).
 *
 * <p>Single source of truth for the fee — the cart, checkout and order total all read
 * from here, so web and mobile cannot drift from what the buyer is actually charged.
 */
@Component
@ConfigurationProperties(prefix = "next360.shipping")
public class ShippingProperties {

    /** Subtotal at or above which delivery is free. */
    private BigDecimal freeDeliveryThreshold = new BigDecimal("499");

    /** Flat fee charged below the threshold. */
    private BigDecimal deliveryFee = new BigDecimal("49");

    /** Delivery fee for the given subtotal. */
    public BigDecimal feeFor(BigDecimal subtotal) {
        if (subtotal == null || subtotal.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        return subtotal.compareTo(freeDeliveryThreshold) >= 0 ? BigDecimal.ZERO : deliveryFee;
    }

    /** How much more the buyer must spend to unlock free delivery. */
    public BigDecimal remainingForFreeDelivery(BigDecimal subtotal) {
        if (subtotal == null) return freeDeliveryThreshold;
        BigDecimal remaining = freeDeliveryThreshold.subtract(subtotal);
        return remaining.signum() > 0 ? remaining : BigDecimal.ZERO;
    }

    public BigDecimal getFreeDeliveryThreshold() { return freeDeliveryThreshold; }
    public void setFreeDeliveryThreshold(BigDecimal freeDeliveryThreshold) { this.freeDeliveryThreshold = freeDeliveryThreshold; }

    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
}
