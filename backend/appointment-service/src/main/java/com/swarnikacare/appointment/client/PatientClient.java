package com.swarnikacare.appointment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "patient-service", path = "/api/v1/patients")
public interface PatientClient {
    
    @GetMapping("/{id}")
    Map<String, Object> getPatientById(@PathVariable("id") Long id);

    @GetMapping("/by-email")
    Map<String, Object> getPatientByEmail(@org.springframework.web.bind.annotation.RequestParam("email") String email);
}
