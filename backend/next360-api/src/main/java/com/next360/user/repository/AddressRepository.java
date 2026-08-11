package com.next360.user.repository;

import com.next360.user.entity.AddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<AddressEntity, UUID> {

    List<AddressEntity> findByUserId(UUID userId);

    Optional<AddressEntity> findByUserIdAndIsDefaultTrue(UUID userId);

    long countByUserId(UUID userId);
}
