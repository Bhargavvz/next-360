package com.next360.common.enums;

/**
 * How the buyer pays for an order.
 */
public enum PaymentMethod {
    /** Online payment through the Razorpay checkout. */
    RAZORPAY,

    /** Cash on delivery — no gateway involved, collected by the courier. */
    COD
}
