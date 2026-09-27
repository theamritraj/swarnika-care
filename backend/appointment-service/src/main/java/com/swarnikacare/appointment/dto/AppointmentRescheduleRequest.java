package com.swarnikacare.appointment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
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

}
