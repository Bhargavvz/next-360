package com.next360.user.entity;

import com.next360.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Core user entity. Every person on the platform has a User record.
 * Sellers are users who additionally have a Seller record.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity extends BaseEntity {

    @Column(name = "phone", nullable = false, unique = true, length = 15)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "is_phone_verified", nullable = false)
    private boolean isPhoneVerified = false;

    /**
     * Set when the user deletes their account. The row survives because orders
     * reference it, but the identity is anonymised — see UserService#deleteAccount.
     */
    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deletion_reason", length = 500)
    private String deletionReason;

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UserRoleEntity> roles = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AddressEntity> addresses = new ArrayList<>();

    public UserEntity(String phone) {
        this.phone = phone;
    }

    public void addRole(UserRoleEntity role) {
        roles.add(role);
        role.setUser(this);
    }

    public void addAddress(AddressEntity address) {
        addresses.add(address);
        address.setUser(this);
    }
}
