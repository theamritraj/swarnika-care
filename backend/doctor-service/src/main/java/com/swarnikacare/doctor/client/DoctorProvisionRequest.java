package com.swarnikacare.doctor.client;

public class DoctorProvisionRequest {
    private String email;

    public DoctorProvisionRequest() {}

    public DoctorProvisionRequest(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
