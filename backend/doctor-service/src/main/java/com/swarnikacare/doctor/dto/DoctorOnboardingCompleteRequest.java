package com.swarnikacare.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorOnboardingCompleteRequest extends DoctorOnboardingInitiateRequest {

    @NotBlank(message = "Verification code (OTP) is required")
    private String otp;

}
