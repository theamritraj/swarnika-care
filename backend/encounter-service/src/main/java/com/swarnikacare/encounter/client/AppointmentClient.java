package com.swarnikacare.encounter.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "appointment-service", path = "/api/v1/appointments")
public interface AppointmentClient {
    @GetMapping("/{id}")
    Map<String, Object> getAppointmentById(@PathVariable("id") Long id);
}
