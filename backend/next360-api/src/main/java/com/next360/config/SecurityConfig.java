package com.next360.config;

import com.next360.common.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration with JWT authentication and RBAC.
 *
 * Public endpoints: health, auth, swagger, product browsing, verification QR.
 * Protected endpoints: everything else requires a valid Bearer token.
 * Admin endpoints: restricted to admin roles.
 * Seller endpoints: restricted to SELLER role.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {
            // Health & Actuator
            "/api/v1/health",
            "/actuator/health",

            // Auth
            "/api/v1/auth/otp/**",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout",

            // Swagger / OpenAPI
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",

            // Public product & verification endpoints
            "/api/v1/verify/**",
    };

    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/v1/products/**",
            "/api/v1/categories/**",
            "/api/v1/search/**",
            "/api/v1/sellers/*/profile",
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Stateless API using JWT
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints — no auth required
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()

                        // Admin endpoints — require admin roles
                        .requestMatchers("/api/v1/admin/**").hasAnyRole(
                                "SUPER_ADMIN", "VERIFICATION_ADMIN",
                                "OPERATIONS_ADMIN", "SUPPORT_ADMIN"
                        )

                        // Seller registration — any authenticated user can register
                        .requestMatchers("/api/v1/seller/register").authenticated()

                        // Seller endpoints — require SELLER role
                        .requestMatchers("/api/v1/seller/**").hasRole("SELLER")

                        // Everything else — must be authenticated
                        .anyRequest().authenticated()
                )
                // Add JWT filter before Spring Security's default auth filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
