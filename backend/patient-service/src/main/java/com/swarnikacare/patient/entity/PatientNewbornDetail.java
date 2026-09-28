package com.swarnikacare.patient.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_newborn_details")
@Getter
@Setter
@NoArgsConstructor
public class PatientNewbornDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false, unique = true)
    private Long patientId; // The baby

    @Column(name = "mother_id", nullable = false)
    private Long motherId;

    @Column(name = "birth_weight_kg")
    private Double birthWeightKg;

    @Column(name = "gestational_age_weeks")
    private Integer gestationalAgeWeeks;

    @Column(name = "delivery_method", length = 50)
    private String deliveryMethod;

    @Column(name = "time_of_birth", nullable = false)
    private LocalDateTime timeOfBirth;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
