package com.next360.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Standard API response wrapper.
 * All API responses must use this format for consistency.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private ApiError error;
    private Instant timestamp;

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Success");
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return error(code, message, null);
    }

    /**
     * The message is mirrored at the top level as well as inside {@code error} so
     * clients can read either {@code data.message} or {@code data.error.message}.
     */
    public static <T> ApiResponse<T> error(String code, String message, java.util.Map<String, String> details) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(new ApiError(code, message, details))
                .timestamp(Instant.now())
                .build();
    }
}
