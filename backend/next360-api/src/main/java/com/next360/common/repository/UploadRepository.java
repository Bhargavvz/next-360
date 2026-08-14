package com.next360.common.repository;

import com.next360.common.entity.UploadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UploadRepository extends JpaRepository<UploadEntity, UUID> {

    Optional<UploadEntity> findByObjectKey(String objectKey);

    void deleteByObjectKey(String objectKey);
}
