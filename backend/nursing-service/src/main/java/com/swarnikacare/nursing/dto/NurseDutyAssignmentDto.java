package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;

public class NurseDutyAssignmentDto {
    @NotNull private Long rosterId;
    @NotNull private String nurseUserId;
    private String role;

    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
