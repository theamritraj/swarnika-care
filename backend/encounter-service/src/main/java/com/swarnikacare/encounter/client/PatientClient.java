package com.swarnikacare.encounter.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "patient-service", path = "/api/v1/patients")
public interface PatientClient {
    @GetMapping("/{id}")
    Map<String, Object> getPatientById(@PathVariable("id") Long id);

    /**
     * Resolves authenticated patient by IAM userId.
     * Called with a special marker header — the actual resolution is
     * done server-side by /me using the forwarded X-User-Id from the gateway.
     * We pass it as a header to simulate the JWT's subject being forwarded.
     */
    @GetMapping("/me")
    Map<String, Object> getPatientMe(@RequestHeader("X-User-Id") String userId);
}
