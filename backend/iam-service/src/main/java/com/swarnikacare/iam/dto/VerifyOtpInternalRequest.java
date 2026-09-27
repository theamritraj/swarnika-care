package com.swarnikacare.iam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class VerifyOtpInternalRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;

    private String purpose = "DOCTOR_ONBOARDING";

    public VerifyOtpInternalRequest(String email, String otp, String purpose) {
        this.email = email;
        this.otp = otp;
        this.purpose = purpose;
    }

}
