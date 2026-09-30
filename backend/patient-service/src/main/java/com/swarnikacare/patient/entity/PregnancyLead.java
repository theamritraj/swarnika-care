package com.swarnikacare.patient.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pregnancy_leads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PregnancyLead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "mobile", nullable = false)
    private String mobile;

    @Column(name = "email")
    private String email;

    @Column(name = "lmp_date")
    private LocalDate lmpDate;

    @Column(name = "cycle_length")
    private Integer cycleLength;

    @Column(name = "estimated_due_date")
    private LocalDate estimatedDueDate;

    @Column(name = "estimated_fetal_age_weeks")
    private Integer estimatedFetalAgeWeeks;

    @Column(name = "estimated_fetal_age_days")
    private Integer estimatedFetalAgeDays;

    @Column(name = "status")
    private String status; // e.g., "NEW", "CONTACTED", "CONVERTED"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
