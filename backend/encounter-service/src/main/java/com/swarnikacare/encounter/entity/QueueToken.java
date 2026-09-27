package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "queue_tokens", indexes = {
        @Index(name = "idx_qt_doctor_date", columnList = "doctor_id, queue_date"),
        @Index(name = "idx_qt_hospital_date", columnList = "hospital_id, queue_date"),
        @Index(name = "idx_qt_patient", columnList = "patient_id"),
        @Index(name = "idx_qt_status", columnList = "status")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_hospital_queue_date_token", columnNames = {"hospital_id", "queue_date", "token_number"})
})
@Getter
@Setter
@NoArgsConstructor
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_number", nullable = false, length = 32)
    private String tokenNumber;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "encounter_id")
    private Long encounterId;

    @Column(name = "queue_date", nullable = false)
    private LocalDate queueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TokenStatus status = TokenStatus.WAITING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TokenPriority priority = TokenPriority.NORMAL;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
