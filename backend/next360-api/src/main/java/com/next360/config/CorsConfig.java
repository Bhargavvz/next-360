package com.next360.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration — allows web, Expo web, iOS simulator, Android emulator,
 * and real devices on the local network.
 */
@Configuration
public class CorsConfig {

    @Value("${next360.cors.allowed-origins:http://localhost:3000,http://localhost:8081}")
    private List<String> configuredOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Use a pattern-based approach so we can allow all local origins
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:*",          // web + Expo web
            "http://10.0.2.2:*",           // Android emulator → host machine
            "http://192.168.*.*:*",        // LAN (real devices on WiFi)
            "http://172.*.*.*:*",          // Docker / alternate LAN ranges
            "http://10.*.*.*:*",           // Corporate / VPN LAN
            "exp://*",                     // Expo Go deep-link scheme
            "https://*.expo.dev"           // Expo hosted previews
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "Accept",
            "X-Requested-With", "Origin", "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}

