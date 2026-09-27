package com.swarnikacare.doctor.dto;

import jakarta.validation.constraints.NotBlank;

public class DoctorOnboardingCompleteRequest extends DoctorOnboardingInitiateRequest {

    @NotBlank(message = "Verification code (OTP) is required")
    private String otp;

    public DoctorOnboardingCompleteRequest() {}

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
