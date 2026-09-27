package com.swarnikacare.doctor.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_hospital_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctorId", "hospitalId", "departmentId"})
})
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

    public DoctorHospitalAssignment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getPublicAppointmentEnabled() { return publicAppointmentEnabled; }
    public void setPublicAppointmentEnabled(Boolean publicAppointmentEnabled) { this.publicAppointmentEnabled = publicAppointmentEnabled; }
    public Boolean getInHouseClinicalEnabled() { return inHouseClinicalEnabled; }
    public void setInHouseClinicalEnabled(Boolean inHouseClinicalEnabled) { this.inHouseClinicalEnabled = inHouseClinicalEnabled; }
}
