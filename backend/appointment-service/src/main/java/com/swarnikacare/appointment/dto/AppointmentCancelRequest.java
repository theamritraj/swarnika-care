package com.swarnikacare.appointment.dto;

import jakarta.validation.constraints.NotNull;

public class AppointmentCancelRequest {

    @NotNull(message = "Cancellation reason is required")
    private String reason;

    public AppointmentCancelRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
