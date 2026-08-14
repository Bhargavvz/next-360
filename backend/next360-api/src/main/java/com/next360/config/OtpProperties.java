package com.next360.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * OTP delivery and verification settings (prefix {@code next360.otp}).
 */
@Component
@ConfigurationProperties(prefix = "next360.otp")
public class OtpProperties {

    /** 2factor.in API key. */
    private String apiKey = "";

    /** Whether real SMS delivery is enabled. When false, the fixed dev OTP is accepted. */
    private boolean enabled = false;

    /** 2factor.in template name. */
    private String template = "AUTOGEN";

    /** How long an OTP stays valid. */
    private int ttlSeconds = 300;

    /** Minimum gap between two OTP requests for the same phone. */
    private int resendCooldownSeconds = 30;

    /** Max OTP requests allowed per phone inside the request window. */
    private int maxRequestsPerWindow = 5;

    /** Rate-limit window length. */
    private int requestWindowSeconds = 900;

    /** Max failed verification attempts before the OTP is invalidated. */
    private int maxVerifyAttempts = 5;

    /** Fixed OTP accepted while SMS delivery is disabled. */
    private String devOtp = "123456";

    /** True when no real SMS provider is wired up, so the fixed dev OTP applies. */
    public boolean isDevMode() {
        return !enabled || apiKey == null || apiKey.isBlank();
    }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public int getTtlSeconds() { return ttlSeconds; }
    public void setTtlSeconds(int ttlSeconds) { this.ttlSeconds = ttlSeconds; }

    public int getResendCooldownSeconds() { return resendCooldownSeconds; }
    public void setResendCooldownSeconds(int resendCooldownSeconds) { this.resendCooldownSeconds = resendCooldownSeconds; }

    public int getMaxRequestsPerWindow() { return maxRequestsPerWindow; }
    public void setMaxRequestsPerWindow(int maxRequestsPerWindow) { this.maxRequestsPerWindow = maxRequestsPerWindow; }

    public int getRequestWindowSeconds() { return requestWindowSeconds; }
    public void setRequestWindowSeconds(int requestWindowSeconds) { this.requestWindowSeconds = requestWindowSeconds; }

    public int getMaxVerifyAttempts() { return maxVerifyAttempts; }
    public void setMaxVerifyAttempts(int maxVerifyAttempts) { this.maxVerifyAttempts = maxVerifyAttempts; }

    public String getDevOtp() { return devOtp; }
    public void setDevOtp(String devOtp) { this.devOtp = devOtp; }
}
