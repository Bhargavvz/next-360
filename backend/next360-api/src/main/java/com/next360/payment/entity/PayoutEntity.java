package com.next360.payment.entity;

import com.next360.common.entity.BaseEntity;
import com.next360.common.enums.PayoutStatus;
import com.next360.seller.entity.SellerEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Seller payout record for a settlement period.
 */
@Entity
@Table(name = "payouts")
@Getter
@Setter
@NoArgsConstructor
public class PayoutEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private SellerEntity seller;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "commission_deducted", nullable = false, precision = 12, scale = 2)
    private BigDecimal commissionDeducted;

    @Column(name = "refunds_deducted", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundsDeducted = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PayoutStatus status = PayoutStatus.PENDING;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "transaction_reference", length = 200)
    private String transactionReference;
}
