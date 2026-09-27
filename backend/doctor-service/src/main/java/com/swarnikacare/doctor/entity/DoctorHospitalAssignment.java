package com.swarnikacare.doctor.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "doctor_hospital_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctorId", "hospitalId", "departmentId"})
})
@Getter
@Setter
@NoArgsConstructor
public class DoctorHospitalAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long doctorId; // Reference to Doctor
    
    @Column(nullable = false)
    private Long hospitalId; // Reference to Hospital in organization-service
    
    @Column(nullable = false)
    private Long departmentId; // Reference to Department in organization-service
    
    private String designation; // e.g., "Senior Consultant"
    
    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(nullable = false)
    private Boolean publicAppointmentEnabled = false;

    @Column(nullable = false)
    private Boolean inHouseClinicalEnabled = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
