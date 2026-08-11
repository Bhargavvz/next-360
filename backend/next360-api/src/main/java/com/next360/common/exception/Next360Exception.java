package com.next360.common.exception;

import lombok.Getter;

/**
 * Base application exception for Next360 business errors.
 */
@Getter
public class Next360Exception extends RuntimeException {

    private final String errorCode;
    private final int httpStatus;

    public Next360Exception(String errorCode, String message, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public Next360Exception(String errorCode, String message) {
        this(errorCode, message, 400);
    }
}
