package com.swarnikacare.doctor.client;

import com.swarnikacare.doctor.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "iam-service", path = "/api/v1/internal/users", configuration = FeignConfig.class)
public interface IamClient {

    @PostMapping("/send-verification-otp")
    java.util.Map<String, Object> sendVerificationOtp(@RequestBody SendVerificationOtpRequest request);

    @PostMapping("/verify-otp")
    java.util.Map<String, Object> verifyOtp(@RequestBody VerifyOtpInternalRequest request);

    @PostMapping("/provision-doctor")
    UserResponse provisionDoctor(@RequestBody DoctorProvisionRequest request);

    @DeleteMapping("/{id}")
    void deleteUser(@PathVariable("id") Long id);
}
