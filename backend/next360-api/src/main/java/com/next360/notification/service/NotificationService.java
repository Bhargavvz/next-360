package com.next360.notification.service;

import com.next360.common.enums.NotificationType;
import com.next360.common.exception.ResourceNotFoundException;
import com.next360.notification.dto.NotificationResponse;
import com.next360.notification.entity.NotificationEntity;
import com.next360.notification.repository.NotificationRepository;
import com.next360.user.entity.UserEntity;
import com.next360.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * In-app notification service.
 * Other services call sendNotification() to create notifications.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Send a notification to a user (called by other services).
     */
    @Transactional
    public void sendNotification(UUID userId, NotificationType type, String title, String message, String data) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Cannot send notification: user {} not found", userId);
            return;
        }

        NotificationEntity notification = new NotificationEntity();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setData(data);

        notificationRepository.save(notification);
        log.debug("Notification sent to {}: [{}] {}", userId, type, title);
    }

    /**
     * Get user notifications (paginated, newest first).
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get unread count.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Mark single notification as read.
     */
    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId.toString()));
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to this user");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Mark all as read.
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    private NotificationResponse mapToResponse(NotificationEntity notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .data(notification.getData())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
