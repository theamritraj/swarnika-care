package com.swarnikacare.notification.service;

import com.swarnikacare.notification.channel.NotificationChannel;
import com.swarnikacare.notification.entity.Notification;
import com.swarnikacare.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationDispatcher {
    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcher.class);
    
    private final List<NotificationChannel> channels;
    private final NotificationRepository repository;

    public NotificationDispatcher(List<NotificationChannel> channels, NotificationRepository repository) {
        this.channels = channels;
        this.repository = repository;
    }

    public void dispatch(Notification notification) {
        for (NotificationChannel channel : channels) {
            if (channel.supports(notification.getChannel())) {
                try {
                    notification.setDeliveryStatus("PROCESSING");
                    repository.save(notification);
                    
                    channel.send(notification);
                    repository.save(notification);
                    log.info("Successfully dispatched notification {} via {}", notification.getId(), notification.getChannel());
                } catch (Exception e) {
                    log.error("Failed to dispatch notification {} via {}", notification.getId(), notification.getChannel(), e);
                    notification.setDeliveryStatus("FAILED");
                    notification.setFailureReason(e.getMessage());
                    notification.setRetryCount(notification.getRetryCount() + 1);
                    repository.save(notification);
                    throw new RuntimeException("Failed to dispatch notification: " + e.getMessage(), e);
                }
                return;
            }
        }
        log.warn("No suitable channel found for type {}", notification.getChannel());
        notification.setDeliveryStatus("FAILED");
        notification.setFailureReason("No supported channel");
        repository.save(notification);
    }
}
