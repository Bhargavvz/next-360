package com.next360.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Razorpay client configuration.
 */
@Configuration
public class RazorpayConfig {

    private static final Logger log = LoggerFactory.getLogger(RazorpayConfig.class);

    @Value("${next360.razorpay.key-id:}")
    private String keyId;

    @Value("${next360.razorpay.key-secret:}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId.isBlank() || keySecret.isBlank()) {
            log.warn("Razorpay keys not configured — payment gateway will use mock mode");
            return null;
        }
        log.info("Razorpay client initialized with key: {}...", keyId.substring(0, Math.min(8, keyId.length())));
        return new RazorpayClient(keyId, keySecret);
    }

    public String getKeyId() {
        return keyId;
    }
}
