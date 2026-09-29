package com.swarnikacare.appointment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.swarnikacare.appointment.entity.AppointmentStatus;
import com.swarnikacare.appointment.entity.AppointmentType;
import com.swarnikacare.appointment.entity.BookingSource;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppointmentResponse {
    private Long id;
    private Long appointmentId;
    private String appointmentNumber;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long hospitalId;
    private String hospitalName;
    private Long departmentId;
    private String departmentName;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String slot;
    private AppointmentStatus status;
    private AppointmentType appointmentType;
    private BookingSource bookingSource;
    private String reason;
    private String notes;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getAppointmentId() {
        return appointmentId != null ? appointmentId : id;
    }
}
