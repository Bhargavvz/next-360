package com.next360.seller.entity;

import com.next360.common.entity.BaseEntity;
import com.next360.common.enums.KycStatus;
import com.next360.common.enums.SellerStatus;
import com.next360.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Seller profile. Linked 1:1 with a User record.
 * A user becomes a seller by registering a business profile.
 */
@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
public class SellerEntity extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(name = "business_name", nullable = false, length = 200)
    private String businessName;

    @Column(name = "business_description", length = 2000)
    private String businessDescription;

    @Column(name = "business_address", length = 500)
    private String businessAddress;

    @Column(name = "gstin", length = 15)
    private String gstin;

    @Column(name = "pan_number", length = 10)
    private String panNumber;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SellerStatus status = SellerStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false, length = 20)
    private KycStatus kycStatus = KycStatus.NOT_SUBMITTED;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "total_orders", nullable = false)
    private int totalOrders = 0;

    @Column(name = "total_products", nullable = false)
    private int totalProducts = 0;

    @Column(name = "commission_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionPercentage = new BigDecimal("15.00");

    @Column(name = "location", length = 200)
    private String location;
}
