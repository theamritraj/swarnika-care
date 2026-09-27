package com.swarnikacare.notification.repository;

import com.swarnikacare.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);
    int countByRecipientUserIdAndIsReadFalse(String recipientUserId);
}
