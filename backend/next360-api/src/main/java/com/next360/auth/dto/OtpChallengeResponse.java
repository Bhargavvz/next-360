package com.next360.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned after an OTP is requested so the client can render validity and
 * resend countdowns instead of guessing them.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OtpChallengeResponse {

    /** Masked destination, e.g. {@code +91 98****210}. */
    private String phone;

    /** Seconds the OTP stays valid. */
    private int expiresIn;

    /** Seconds before another OTP can be requested. */
    private int resendIn;

    /** True when SMS delivery is off and the fixed development OTP is accepted. */
    private boolean devMode;

    /** The development OTP — only populated when {@link #devMode} is true. */
    private String devOtp;
}
