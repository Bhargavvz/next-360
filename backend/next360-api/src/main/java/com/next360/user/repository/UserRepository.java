package com.next360.user.repository;

import com.next360.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByPhone(String phone);

    boolean existsByPhone(String phone);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
