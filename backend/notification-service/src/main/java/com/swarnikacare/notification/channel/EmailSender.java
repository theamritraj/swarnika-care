package com.swarnikacare.notification.channel;

public interface EmailSender {
    void sendEmail(String to, String subject, String content);
}
