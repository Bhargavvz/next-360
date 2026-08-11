package com.next360.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP generation and verification service.
 *
 * Dev mode: always accepts OTP "123456" and logs OTP to console.
 * Production: generates random 6-digit OTP, stores in Redis with 5 min TTL.
 * Rate limit: max 5 OTP requests per phone per 15 minutes.
 *
 * Falls back to in-memory storage when Redis is unavailable.
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private static final String OTP_PREFIX = "otp:";
    private static final String RATE_LIMIT_PREFIX = "otp_rate:";
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final Duration RATE_LIMIT_TTL = Duration.ofMinutes(15);
    private static final int MAX_OTP_REQUESTS = 5;
    private static final String DEV_OTP = "123456";

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom random = new SecureRandom();
    private final boolean devMode;
    private final boolean redisAvailable;

    // In-memory fallback for when Redis is unavailable
    private final Map<String, OtpEntry> memoryStore = new ConcurrentHashMap<>();

    private record OtpEntry(String otp, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    public OtpService(
            StringRedisTemplate redisTemplate,
            @Value("${spring.profiles.active:dev}") String activeProfile
    ) {
        this.redisTemplate = redisTemplate;
        this.devMode = "dev".equals(activeProfile);
        this.redisAvailable = isRedisAvailable(redisTemplate);

        if (!redisAvailable) {
            log.warn("Redis is not available — using in-memory OTP storage (dev only)");
        }
    }

    /**
     * Generate and store an OTP for the given phone number.
     */
    public String generateOtp(String phone) {
        // Rate limit check (simplified for in-memory)
        if (redisAvailable) {
            checkRateLimitRedis(phone);
        }

        // Generate OTP
        String otp = devMode ? DEV_OTP : String.format("%06d", random.nextInt(1_000_000));

        // Store
        if (redisAvailable) {
            String otpKey = OTP_PREFIX + phone;
            redisTemplate.opsForValue().set(otpKey, otp, OTP_TTL);
        } else {
            memoryStore.put(phone, new OtpEntry(otp, Instant.now().plus(OTP_TTL)));
        }

        log.info("OTP generated for phone {}: {}", maskPhone(phone), devMode ? otp : "******");

        if (devMode) {
            log.info("======================================");
            log.info("  [DEV MODE] OTP for {}: {}", phone, otp);
            log.info("======================================");
        }

        return otp;
    }

    /**
     * Verify the OTP for a given phone number.
     */
    public boolean verifyOtp(String phone, String otp) {
        // Dev mode: always accept the fixed OTP
        if (devMode && DEV_OTP.equals(otp)) {
            deleteOtp(phone);
            return true;
        }

        String storedOtp;
        if (redisAvailable) {
            storedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + phone);
        } else {
            OtpEntry entry = memoryStore.get(phone);
            storedOtp = (entry != null && !entry.isExpired()) ? entry.otp() : null;
        }

        if (storedOtp != null && storedOtp.equals(otp)) {
            deleteOtp(phone);
            return true;
        }

        log.warn("OTP verification failed for phone {}", maskPhone(phone));
        return false;
    }

    private void checkRateLimitRedis(String phone) {
        String rateLimitKey = RATE_LIMIT_PREFIX + phone;
        Long currentCount = redisTemplate.opsForValue().increment(rateLimitKey);

        if (currentCount != null && currentCount == 1) {
            redisTemplate.expire(rateLimitKey, RATE_LIMIT_TTL);
        }

        if (currentCount != null && currentCount > MAX_OTP_REQUESTS) {
            throw new IllegalStateException("Too many OTP requests. Please try after 15 minutes.");
        }
    }

    private void deleteOtp(String phone) {
        if (redisAvailable) {
            redisTemplate.delete(OTP_PREFIX + phone);
        } else {
            memoryStore.remove(phone);
        }
    }

    private String maskPhone(String phone) {
        if (phone.length() < 6) return "****";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
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
