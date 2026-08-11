package com.next360.dispute.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Individual message within a dispute thread.
 */
@Entity
@Table(name = "dispute_messages")
@Getter
@Setter
@NoArgsConstructor
public class DisputeMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispute_id", nullable = false)
    private DisputeEntity dispute;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "sender_role", nullable = false, length = 30)
    private String senderRole;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    /** Stored as JSONB array of attachment URLs */
    @Column(name = "attachments", columnDefinition = "JSONB")
    private String attachments;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
