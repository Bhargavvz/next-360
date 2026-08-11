package com.next360.common.security;

import com.next360.common.enums.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * JWT token generation, validation, and refresh token management.
 *
 * Access tokens: short-lived (1h), carry userId + roles in claims.
 * Refresh tokens: long-lived (7d), stored in Redis for revocation support.
 *
 * Falls back to in-memory storage when Redis is unavailable.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private static final String REDIS_REFRESH_PREFIX = "refresh:";
    private static final String CLAIMS_ROLES = "roles";
    private static final String CLAIMS_PHONE = "phone";

    private final SecretKey signingKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final StringRedisTemplate redisTemplate;
    private final boolean redisAvailable;

    // In-memory fallback for refresh tokens when Redis is unavailable
    private final Map<String, Instant> memoryRefreshTokens = new ConcurrentHashMap<>();

    public JwtService(
            @Value("${next360.jwt.secret}") String secret,
            @Value("${next360.jwt.expiration}") long accessTokenExpiration,
            @Value("${next360.jwt.refresh-expiration}") long refreshTokenExpiration,
            StringRedisTemplate redisTemplate
    ) {
        // Pad secret to at least 32 bytes for HMAC-SHA256
        String paddedSecret = secret.length() < 32
                ? secret + "0".repeat(32 - secret.length())
                : secret;
        this.signingKey = Keys.hmacShaKeyFor(paddedSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.redisTemplate = redisTemplate;
        this.redisAvailable = isRedisAvailable(redisTemplate);

        if (!redisAvailable) {
            log.warn("Redis is not available — using in-memory refresh token storage (dev only)");
        }
    }

    /**
     * Generate a short-lived access token with user claims.
     */
    public String generateAccessToken(UUID userId, String phone, List<UserRole> roles) {
        List<String> roleNames = roles.stream().map(UserRole::name).toList();

        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIMS_PHONE, phone)
                .claim(CLAIMS_ROLES, roleNames)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Generate a long-lived refresh token and store for revocation support.
     */
    public String generateRefreshToken(UUID userId) {
        String tokenId = UUID.randomUUID().toString();

        String token = Jwts.builder()
                .subject(userId.toString())
                .id(tokenId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(signingKey)
                .compact();

        // Store for revocation support
        String key = REDIS_REFRESH_PREFIX + userId + ":" + tokenId;
        Instant expiresAt = Instant.now().plusMillis(refreshTokenExpiration);

        if (redisAvailable) {
            redisTemplate.opsForValue().set(key, "active", Duration.ofMillis(refreshTokenExpiration));
        } else {
            memoryRefreshTokens.put(key, expiresAt);
        }

        return token;
    }

    /**
     * Validate a token and return its claims. Returns empty if invalid/expired.
     */
    public Optional<Claims> validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("Invalid JWT: {}", e.getMessage());
        }
        return Optional.empty();
    }

    /**
     * Validate a refresh token: must be parseable AND exist in store.
     */
    public Optional<Claims> validateRefreshToken(String token) {
        return validateToken(token).filter(claims -> {
            String key = REDIS_REFRESH_PREFIX + claims.getSubject() + ":" + claims.getId();
            if (redisAvailable) {
                return Boolean.TRUE.equals(redisTemplate.hasKey(key));
            } else {
                Instant expiry = memoryRefreshTokens.get(key);
                return expiry != null && Instant.now().isBefore(expiry);
            }
        });
    }

    /**
     * Revoke a refresh token by removing it from the store.
     */
    public void revokeRefreshToken(String token) {
        validateToken(token).ifPresent(claims -> {
            String key = REDIS_REFRESH_PREFIX + claims.getSubject() + ":" + claims.getId();
            if (redisAvailable) {
                redisTemplate.delete(key);
            } else {
                memoryRefreshTokens.remove(key);
            }
        });
    }

    /**
     * Revoke ALL refresh tokens for a user.
     */
    public void revokeAllRefreshTokens(UUID userId) {
        if (redisAvailable) {
            Set<String> keys = redisTemplate.keys(REDIS_REFRESH_PREFIX + userId + ":*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } else {
            String prefix = REDIS_REFRESH_PREFIX + userId + ":";
            memoryRefreshTokens.keySet().removeIf(k -> k.startsWith(prefix));
        }
    }

    /**
     * Extract user ID from token claims.
     */
    public UUID getUserIdFromClaims(Claims claims) {
        return UUID.fromString(claims.getSubject());
    }

    /**
     * Extract roles from token claims.
     */
    @SuppressWarnings("unchecked")
    public List<UserRole> getRolesFromClaims(Claims claims) {
        List<String> roleNames = claims.get(CLAIMS_ROLES, List.class);
        if (roleNames == null) return List.of();
        return roleNames.stream().map(UserRole::valueOf).toList();
    }

    /**
     * Extract phone from token claims.
     */
    public String getPhoneFromClaims(Claims claims) {
        return claims.get(CLAIMS_PHONE, String.class);
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    private static boolean isRedisAvailable(StringRedisTemplate template) {
        try {
            template.getConnectionFactory().getConnection().ping();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
