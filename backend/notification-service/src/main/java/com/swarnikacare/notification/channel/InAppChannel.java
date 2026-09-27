package com.swarnikacare.notification.channel;

import com.swarnikacare.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class InAppChannel implements NotificationChannel {

    @Override
    public boolean supports(String channelType) {
        return "IN_APP".equalsIgnoreCase(channelType);
    }

    @Override
    public void send(Notification notification) throws Exception {
        // In-App notifications are simply persisted in the DB and queried via API.
        // No active push is implemented here (e.g. WebSocket), though it could be added in the future.
        notification.setDeliveryStatus("DELIVERED");
    }
}
