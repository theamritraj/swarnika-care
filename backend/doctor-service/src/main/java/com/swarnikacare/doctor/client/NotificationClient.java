package com.swarnikacare.doctor.client;

import com.swarnikacare.doctor.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "notification-service", path = "/api/v1/notifications", configuration = FeignConfig.class)
public interface NotificationClient {

    @PostMapping("/doctor-welcome")
    Map<String, Object> sendDoctorWelcome(@RequestBody DoctorWelcomeNotificationRequest request);
}
