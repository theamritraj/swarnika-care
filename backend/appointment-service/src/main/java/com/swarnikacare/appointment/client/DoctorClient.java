package com.swarnikacare.appointment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "doctor-service", path = "/api/v1/doctors")
public interface DoctorClient {
    
    @GetMapping("/{id}")
    Map<String, Object> getDoctorById(@PathVariable("id") Long id);
    
    @GetMapping("/{id}/availability")
    Map<String, Object> getDoctorAvailability(@PathVariable("id") Long id);
}
