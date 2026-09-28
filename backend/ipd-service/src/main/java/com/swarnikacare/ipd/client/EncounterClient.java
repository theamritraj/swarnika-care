package com.swarnikacare.ipd.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@FeignClient(name = "encounter-service", path = "/api/v1/admissions")
public interface EncounterClient {
    @PutMapping("/{id}/status")
    Map<String, Object> updateAdmissionStatus(@PathVariable Long id, @RequestParam(required = false) String status, @RequestParam(required = false) Long bedId, @RequestParam(required = false) String notes);
    
    @GetMapping("/{id}")
    Map<String, Object> getAdmissionById(@PathVariable Long id);
}