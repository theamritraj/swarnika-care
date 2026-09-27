package com.swarnikacare.doctor.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "organization-service", path = "/api/v1")
public interface OrganizationClient {

    @GetMapping("/hospitals/{id}")
    Map<String, Object> getHospitalById(@PathVariable("id") Long id);

    @GetMapping("/departments/{id}")
    Map<String, Object> getDepartmentById(@PathVariable("id") Long id);
}
