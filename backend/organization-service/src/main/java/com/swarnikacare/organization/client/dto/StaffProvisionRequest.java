package com.swarnikacare.organization.client.dto;

public class StaffProvisionRequest {
    private String email;
    private String role;

    public StaffProvisionRequest() {}

    public StaffProvisionRequest(String email, String role) {
        this.email = email;
        this.role = role;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
