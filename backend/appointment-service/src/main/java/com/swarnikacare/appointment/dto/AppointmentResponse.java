package com.swarnikacare.appointment.dto;

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
public class AppointmentResponse {
    private Long id;
    private String appointmentNumber;
    private Long patientId;
    private Long doctorId;
    private Long hospitalId;
    private Long departmentId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
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

}
