package com.swarnikacare.notification.channel;

import com.swarnikacare.notification.entity.Notification;

public interface NotificationChannel {
    boolean supports(String channelType);
    void send(Notification notification) throws Exception;
}
