package com.swarnikacare.appointment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentRescheduleRequest {

    @NotNull(message = "New appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate newAppointmentDate;

    @NotNull(message = "New start time is required")
    private LocalTime newStartTime;

    @NotNull(message = "New end time is required")
    private LocalTime newEndTime;

    @NotNull(message = "Reschedule reason is required")
    private String reason;

    public AppointmentRescheduleRequest() {}

    public LocalDate getNewAppointmentDate() { return newAppointmentDate; }
    public void setNewAppointmentDate(LocalDate newAppointmentDate) { this.newAppointmentDate = newAppointmentDate; }
    public LocalTime getNewStartTime() { return newStartTime; }
    public void setNewStartTime(LocalTime newStartTime) { this.newStartTime = newStartTime; }
    public LocalTime getNewEndTime() { return newEndTime; }
    public void setNewEndTime(LocalTime newEndTime) { this.newEndTime = newEndTime; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
