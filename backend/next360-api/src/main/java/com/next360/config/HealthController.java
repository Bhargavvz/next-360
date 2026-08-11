package com.next360.config;

import com.next360.common.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check controller.
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success(
                Map.of(
                        "status", "UP",
                        "service", "next360-api",
                        "version", "0.1.0"
                ),
                "Service is healthy"
        );
    }
}
