package com.swarnikacare.organization.client;

import com.swarnikacare.organization.client.dto.IamUserResponse;
import com.swarnikacare.organization.client.dto.StaffProvisionRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "iam-service", configuration = FeignConfig.class)
public interface IamClient {

    @PostMapping("/api/v1/internal/users/provision-staff")
    IamUserResponse provisionStaff(@RequestBody StaffProvisionRequest request);

    @GetMapping("/api/v1/internal/users/{id}")
    IamUserResponse getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/v1/internal/users/by-email")
    IamUserResponse getUserByEmail(@RequestParam("email") String email);

    @DeleteMapping("/api/v1/internal/users/{id}")
    void deleteUser(@PathVariable("id") Long id);
}
