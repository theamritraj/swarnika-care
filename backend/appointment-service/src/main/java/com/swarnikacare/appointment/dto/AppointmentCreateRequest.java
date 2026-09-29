package com.swarnikacare.appointment.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.swarnikacare.appointment.entity.AppointmentType;
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
public class AppointmentCreateRequest {

    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Long hospitalId;

    private Long departmentId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    @NotNull(message = "Start time is required")
    @JsonDeserialize(using = FlexibleLocalTimeDeserializer.class)
    private LocalTime startTime;

    @JsonDeserialize(using = FlexibleLocalTimeDeserializer.class)
    private LocalTime endTime;

    private AppointmentType appointmentType;

    private String reason;
    private String notes;

    // Optional fields for public booking
    private String patientName;
    private String patientMobile;
    private String patientEmail;

}
