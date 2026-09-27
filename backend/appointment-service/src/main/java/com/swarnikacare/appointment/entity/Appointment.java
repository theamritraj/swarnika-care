package com.swarnikacare.appointment.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "appointments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctorId", "appointmentDate", "startTime"})
})
@Getter
@Setter
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String appointmentNumber;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long hospitalId;

    @Column(nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentType appointmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingSource bookingSource;

    @Column(name = "reason")
    private String reason;

    private String notes;

    private String cancellationReason;

    private LocalDateTime cancelledAt;

    private LocalDateTime completedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
