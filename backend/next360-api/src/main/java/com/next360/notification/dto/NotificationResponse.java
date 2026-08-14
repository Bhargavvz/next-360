package com.next360.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.next360.common.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Notification response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private NotificationType type;
    private String title;
    private String message;
    private String data;
    @JsonProperty("isRead")
    private boolean read;
    private Instant createdAt;
}
