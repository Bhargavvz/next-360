package com.next360.user.repository;

import com.next360.common.enums.UserRole;
import com.next360.user.entity.UserRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRoleEntity, UUID> {

    List<UserRoleEntity> findByUserId(UUID userId);

    boolean existsByUserIdAndRole(UUID userId, UserRole role);

    void deleteByUserIdAndRole(UUID userId, UserRole role);
}
