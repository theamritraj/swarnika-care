package com.swarnikacare.iam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class DoctorProvisionRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    public DoctorProvisionRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
