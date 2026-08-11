package com.next360.common.security;

import com.next360.common.enums.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Static utility methods for accessing the current authenticated user.
 * Use in service/controller layers to get the caller's identity.
 */
public final class SecurityUtils {

    private SecurityUtils() {} // Utility class

    /**
     * Get the current authenticated user's ID.
     * @throws IllegalStateException if no authentication exists
     */
    public static UUID getCurrentUserId() {
        return getCurrentUserPrincipal().getUserId();
    }

    /**
     * Get the current authenticated UserPrincipal.
     * @throws IllegalStateException if no authentication exists
     */
    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found in security context");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    /**
     * Check if the current user has a specific role.
     */
    public static boolean hasRole(UserRole role) {
        try {
            return getCurrentUserPrincipal().getRoles().contains(role);
        } catch (IllegalStateException e) {
            return false;
        }
    }

    /**
     * Check if the current user is authenticated.
     */
    public static boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof UserPrincipal;
    }
}
