package com.next360.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Razorpay credentials and client wiring.
 *
 * <p>The {@link RazorpayClient} bean only exists when both keys are configured;
 * without it {@code PaymentService} falls back to mock mode for local development.
 */
@Configuration
public class RazorpayConfig {

    private static final Logger log = LoggerFactory.getLogger(RazorpayConfig.class);

    @Value("${next360.razorpay.key-id:}")
    private String keyId;

    @Value("${next360.razorpay.key-secret:}")
    private String keySecret;

    @Value("${next360.razorpay.webhook-secret:}")
    private String webhookSecret;

    @Value("${next360.razorpay.currency:INR}")
    private String currency;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId.isBlank() || keySecret.isBlank()) {
            log.warn("Razorpay keys not configured — payment gateway runs in mock mode");
            return null;
        }
        log.info("Razorpay client initialized (key {}…)", keyId.substring(0, Math.min(11, keyId.length())));
        return new RazorpayClient(keyId, keySecret);
    }

    public String getKeyId() {
        return keyId;
    }

    /**
     * The key secret. Required for HMAC signature verification of checkout
     * callbacks — never send this to a client.
     */
    public String getKeySecret() {
        return keySecret;
    }

    /** Webhook signing secret; falls back to the key secret when unset. */
    public String getWebhookSecret() {
        return webhookSecret == null || webhookSecret.isBlank() ? keySecret : webhookSecret;
    }

    public String getCurrency() {
        return currency;
    }

    public boolean isConfigured() {
        return !keyId.isBlank() && !keySecret.isBlank();
    }
}
