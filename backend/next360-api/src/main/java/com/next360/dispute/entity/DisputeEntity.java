package com.next360.dispute.entity;

import com.next360.common.entity.BaseEntity;
import com.next360.common.enums.DisputeStatus;
import com.next360.user.entity.UserEntity;
import com.next360.seller.entity.SellerEntity;
import com.next360.order.entity.OrderEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Customer-seller dispute associated with an order.
 */
@Entity
@Table(name = "disputes")
@Getter
@Setter
@NoArgsConstructor
public class DisputeEntity extends BaseEntity {

    @Column(name = "ticket_number", nullable = false, unique = true, length = 20)
    private String ticketNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(name = "product_id")
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserEntity customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private SellerEntity seller;

    @Column(name = "assigned_admin_id")
    private UUID assignedAdminId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 25)
    private DisputeStatus status = DisputeStatus.OPEN;

    @Column(name = "subject", nullable = false, length = 200)
    private String subject;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "resolution", columnDefinition = "TEXT")
    private String resolution;

    @OneToMany(mappedBy = "dispute", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<DisputeMessageEntity> messages = new ArrayList<>();

    public void addMessage(DisputeMessageEntity message) {
        messages.add(message);
        message.setDispute(this);
    }
}
