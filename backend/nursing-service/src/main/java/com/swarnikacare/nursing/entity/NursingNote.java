package com.swarnikacare.nursing.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "nursing_notes")
public class NursingNote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "encounter_id")
    private Long encounterId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "nurse_user_id", nullable = false, length = 100)
    private String nurseUserId;
    @Column(name = "note_type", nullable = false, length = 50)
    private String noteType;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(length = 50)
    private String status = "FINAL";
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getEncounterId() { return encounterId; }
    public void setEncounterId(Long encounterId) { this.encounterId = encounterId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
