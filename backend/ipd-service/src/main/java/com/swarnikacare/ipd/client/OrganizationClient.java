package com.swarnikacare.ipd.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@FeignClient(name = "organization-service", path = "/api/v1/beds")
public interface OrganizationClient {
    @PutMapping("/{id}/status")
    Map<String, Object> updateBedStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> status);
    
    @GetMapping("/{id}")
    Map<String, Object> getBedById(@PathVariable("id") Long id);
}