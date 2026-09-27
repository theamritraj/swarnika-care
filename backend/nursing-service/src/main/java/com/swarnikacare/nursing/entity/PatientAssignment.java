package com.swarnikacare.nursing.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "patient_assignments")
public class PatientAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "room_id", nullable = false)
    private Long roomId;
    @Column(name = "bed_id", nullable = false)
    private Long bedId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "nurse_user_id", nullable = false, length = 100)
    private String nurseUserId;
    @Column(name = "roster_id", nullable = false)
    private Long rosterId;
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt = LocalDateTime.now();
    @Column(name = "unassigned_at")
    private LocalDateTime unassignedAt;
    @Column(length = 50)
    private String status = "ACTIVE";
    @Column(name = "assignment_notes", columnDefinition = "TEXT")
    private String assignmentNotes;
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public Long getBedId() { return bedId; }
    public void setBedId(Long bedId) { this.bedId = bedId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public LocalDateTime getUnassignedAt() { return unassignedAt; }
    public void setUnassignedAt(LocalDateTime unassignedAt) { this.unassignedAt = unassignedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignmentNotes() { return assignmentNotes; }
    public void setAssignmentNotes(String assignmentNotes) { this.assignmentNotes = assignmentNotes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
