package com.next360.auth.service;

import com.next360.config.OtpProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP generation, delivery via 2factor.in, and verification.
 *
 * <p>Codes are stored hashed (never in plaintext) with a TTL, a per-phone request
 * rate limit, a resend cooldown, and a cap on failed verification attempts.
 *
 * <p>When no SMS provider is configured ({@code next360.otp.enabled=false} or a blank
 * API key) the service runs in dev mode: the fixed {@code next360.otp.dev-otp} code is
 * issued and logged instead of being texted.
 *
 * <p>Redis is used when reachable; otherwise an in-memory store keeps local development
 * working (single-instance only).
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private static final String OTP_PREFIX = "otp:code:";
    private static final String ATTEMPT_PREFIX = "otp:attempts:";
    private static final String COOLDOWN_PREFIX = "otp:cooldown:";
    private static final String RATE_LIMIT_PREFIX = "otp:rate:";

    private final StringRedisTemplate redisTemplate;
    private final OtpProperties props;
    private final SecureRandom random = new SecureRandom();
    private final RestTemplate restTemplate = new RestTemplate();
    private final boolean redisAvailable;

    /** In-memory fallback used only when Redis is unreachable. */
    private final Map<String, Entry> memoryStore = new ConcurrentHashMap<>();

    private static final class Entry {
        String value;
        int counter;
        Instant expiresAt;

        Entry(String value, Instant expiresAt) {
            this.value = value;
            this.expiresAt = expiresAt;
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    /**
     * Result of an OTP request, returned to the client so it can show a countdown.
     *
     * @param expiresInSeconds  remaining validity of the code
     * @param resendInSeconds   seconds until another OTP may be requested
     * @param devMode           true when SMS delivery is off and the fixed dev code applies
     * @param devOtp            the dev code, only populated in dev mode
     */
    public record OtpChallenge(int expiresInSeconds, int resendInSeconds, boolean devMode, String devOtp) {}

    public OtpService(StringRedisTemplate redisTemplate, OtpProperties props) {
        this.redisTemplate = redisTemplate;
        this.props = props;
        this.redisAvailable = isRedisAvailable(redisTemplate);

        if (!redisAvailable) {
            log.warn("Redis is not available — using in-memory OTP storage (single instance, dev only)");
        }
        if (props.isDevMode()) {
            log.warn("SMS OTP delivery is DISABLED — the fixed dev OTP will be accepted and logged. "
                    + "Set OTP_ENABLED=true and OTP_PROVIDER_KEY to send real SMS.");
        } else {
            log.info("2factor.in SMS OTP delivery is ENABLED (template={})", props.getTemplate());
        }
    }

    /**
     * Generate, store and deliver an OTP for the given phone number.
     *
     * @throws IllegalStateException if the caller is inside the resend cooldown or over the rate limit
     */
    public OtpChallenge requestOtp(String phone) {
        enforceCooldown(phone);
        enforceRateLimit(phone);

        String otp = props.isDevMode()
                ? props.getDevOtp()
                : String.format("%06d", random.nextInt(1_000_000));

        Duration ttl = Duration.ofSeconds(props.getTtlSeconds());
        put(OTP_PREFIX + phone, hash(otp), ttl);
        put(ATTEMPT_PREFIX + phone, "0", ttl);
        put(COOLDOWN_PREFIX + phone, "1", Duration.ofSeconds(props.getResendCooldownSeconds()));

        if (props.isDevMode()) {
            log.info("======================================");
            log.info("  [DEV MODE] OTP for {}: {}", phone, otp);
            log.info("======================================");
        } else {
            sendSmsVia2Factor(phone, otp);
        }

        return new OtpChallenge(
                props.getTtlSeconds(),
                props.getResendCooldownSeconds(),
                props.isDevMode(),
                props.isDevMode() ? otp : null
        );
    }

    /**
     * Verify an OTP. A wrong code burns one attempt; the code is invalidated once
     * {@code max-verify-attempts} is reached, forcing the user to request a new one.
     */
    public boolean verifyOtp(String phone, String otp) {
        String storedHash = get(OTP_PREFIX + phone);
        if (storedHash == null) {
            log.warn("OTP verification failed for {} — no active code", maskPhone(phone));
            return false;
        }

        if (constantTimeEquals(storedHash, hash(otp))) {
            clear(phone);
            return true;
        }

        int attempts = increment(ATTEMPT_PREFIX + phone, Duration.ofSeconds(props.getTtlSeconds()));
        if (attempts >= props.getMaxVerifyAttempts()) {
            clear(phone);
            log.warn("OTP for {} invalidated after {} failed attempts", maskPhone(phone), attempts);
            throw new IllegalStateException("Too many incorrect attempts. Please request a new OTP.");
        }

        log.warn("OTP verification failed for {} (attempt {}/{})",
                maskPhone(phone), attempts, props.getMaxVerifyAttempts());
        return false;
    }

    /** Remaining seconds before another OTP may be requested; 0 when a resend is allowed now. */
    public long resendCooldownRemaining(String phone) {
        return ttl(COOLDOWN_PREFIX + phone);
    }

    // ---- Delivery ----

    /**
     * Send the OTP via the 2factor.in SMS API.
     * Delivery failures are logged but not thrown: the code is already stored, so a user
     * who receives the SMS through a retry can still complete verification.
     *
     * @see <a href="https://2factor.in/api-docs">2factor.in API docs</a>
     */
    private void sendSmsVia2Factor(String phone, String otp) {
        try {
            String cleanPhone = phone.startsWith("+") ? phone.substring(1) : phone;
            String url = String.format(
                    "https://2factor.in/API/V1/%s/SMS/%s/%s/%s",
                    UriUtils.encodePathSegment(props.getApiKey(), StandardCharsets.UTF_8),
                    UriUtils.encodePathSegment(cleanPhone, StandardCharsets.UTF_8),
                    UriUtils.encodePathSegment(otp, StandardCharsets.UTF_8),
                    UriUtils.encodePathSegment(props.getTemplate(), StandardCharsets.UTF_8)
            );

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String body = response.getBody();
            if (body != null && body.contains("\"Status\":\"Error\"")) {
                log.error("2factor.in rejected the SMS for {}: {}", maskPhone(phone), body);
            } else {
                log.info("2factor.in SMS dispatched to {}", maskPhone(phone));
            }
        } catch (Exception e) {
            log.error("Failed to send SMS via 2factor.in to {}: {}", maskPhone(phone), e.getMessage());
        }
    }

    // ---- Guards ----

    private void enforceCooldown(String phone) {
        long remaining = ttl(COOLDOWN_PREFIX + phone);
        if (remaining > 0) {
            throw new IllegalStateException("Please wait " + remaining + "s before requesting another OTP.");
        }
    }

    private void enforceRateLimit(String phone) {
        int count = increment(RATE_LIMIT_PREFIX + phone, Duration.ofSeconds(props.getRequestWindowSeconds()));
        if (count > props.getMaxRequestsPerWindow()) {
            long minutes = Math.max(1, ttl(RATE_LIMIT_PREFIX + phone) / 60);
            throw new IllegalStateException("Too many OTP requests. Please try again in " + minutes + " minute(s).");
        }
    }

    private void clear(String phone) {
        delete(OTP_PREFIX + phone);
        delete(ATTEMPT_PREFIX + phone);
    }

    // ---- Storage (Redis with in-memory fallback) ----

    private void put(String key, String value, Duration ttl) {
        if (redisAvailable) {
            redisTemplate.opsForValue().set(key, value, ttl);
        } else {
            memoryStore.put(key, new Entry(value, Instant.now().plus(ttl)));
        }
    }

    private String get(String key) {
        if (redisAvailable) {
            return redisTemplate.opsForValue().get(key);
        }
        Entry entry = memoryStore.get(key);
        if (entry == null) return null;
        if (entry.isExpired()) {
            memoryStore.remove(key);
            return null;
        }
        return entry.value;
    }

    private void delete(String key) {
        if (redisAvailable) {
            redisTemplate.delete(key);
        } else {
            memoryStore.remove(key);
        }
    }

    /** Increment a counter, setting the TTL on first use. Returns the new value. */
    private int increment(String key, Duration ttl) {
        if (redisAvailable) {
            Long value = redisTemplate.opsForValue().increment(key);
            long count = value == null ? 1L : value;
            if (count == 1L) {
                redisTemplate.expire(key, ttl);
            }
            return (int) count;
        }
        Entry entry = memoryStore.compute(key, (k, existing) -> {
            if (existing == null || existing.isExpired()) {
                return new Entry(null, Instant.now().plus(ttl));
            }
            return existing;
        });
        synchronized (entry) {
            entry.counter++;
            return entry.counter;
        }
    }

    /** Remaining TTL of a key in seconds, or 0 when absent/expired. */
    private long ttl(String key) {
        if (redisAvailable) {
            Long seconds = redisTemplate.getExpire(key);
            return seconds == null || seconds < 0 ? 0 : seconds;
        }
        Entry entry = memoryStore.get(key);
        if (entry == null || entry.isExpired()) return 0;
        return Math.max(0, Duration.between(Instant.now(), entry.expiresAt).toSeconds());
    }

    // ---- Helpers ----

    private static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    private static String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return "****";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }

    private static boolean isRedisAvailable(StringRedisTemplate template) {
        try {
            var factory = template.getConnectionFactory();
            if (factory == null) return false;
            try (var connection = factory.getConnection()) {
                connection.ping();
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
