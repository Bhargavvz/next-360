package com.next360.audit.repository;

import com.next360.common.enums.AuditAction;
import com.next360.audit.entity.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {

    Page<AuditLogEntity> findByEntityTypeAndEntityIdOrderByTimestampDesc(
            String entityType, UUID entityId, Pageable pageable);

    Page<AuditLogEntity> findByActorIdOrderByTimestampDesc(UUID actorId, Pageable pageable);

    Page<AuditLogEntity> findByActionOrderByTimestampDesc(AuditAction action, Pageable pageable);
}
