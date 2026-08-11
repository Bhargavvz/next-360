package com.next360.common.security;

import com.next360.common.enums.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Represents the authenticated user within Spring Security context.
 * Wraps user identity and roles from the JWT claims.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final UUID userId;
    private final String phone;
    private final List<UserRole> roles;

    public UserPrincipal(UUID userId, String phone, List<UserRole> roles) {
        this.userId = userId;
        this.phone = phone;
        this.roles = roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();
    }

    @Override
    public String getPassword() {
        return null; // OTP-based auth — no password
    }

    @Override
    public String getUsername() {
        return phone;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
