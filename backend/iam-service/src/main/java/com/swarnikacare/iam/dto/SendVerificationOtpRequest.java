package com.swarnikacare.iam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class SendVerificationOtpRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String purpose = "DOCTOR_ONBOARDING";

    public SendVerificationOtpRequest(String email, String purpose) {
        this.email = email;
        this.purpose = purpose;
    }

}
