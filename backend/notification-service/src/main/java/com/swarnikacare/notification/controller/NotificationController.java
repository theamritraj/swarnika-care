package com.swarnikacare.notification.controller;

import com.swarnikacare.notification.entity.Notification;
import com.swarnikacare.notification.repository.NotificationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> getMyNotifications(@RequestParam String userId) {
        List<Notification> notifs = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", notifs);
        return response;
    }
}
