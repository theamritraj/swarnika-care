package com.swarnikacare.nursing.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "shift_handovers")
public class ShiftHandover {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "roster_id", nullable = false)
    private Long rosterId;
    @Column(name = "from_nurse_user_id", nullable = false, length = 100)
    private String fromNurseUserId;
    @Column(name = "to_nurse_user_id", nullable = false, length = 100)
    private String toNurseUserId;
    @Column(name = "patient_assignment_id")
    private Long patientAssignmentId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(columnDefinition = "TEXT")
    private String summary;
    @Column(name = "pending_tasks", columnDefinition = "TEXT")
    private String pendingTasks;
    @Column(name = "important_observations", columnDefinition = "TEXT")
    private String importantObservations;
    @Column(name = "pending_investigations", columnDefinition = "TEXT")
    private String pendingInvestigations;
    @Column(name = "pending_medication_actions", columnDefinition = "TEXT")
    private String pendingMedicationActions;
    @Column(length = 50)
    private String status = "DRAFT";
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public String getFromNurseUserId() { return fromNurseUserId; }
    public void setFromNurseUserId(String fromNurseUserId) { this.fromNurseUserId = fromNurseUserId; }
    public String getToNurseUserId() { return toNurseUserId; }
    public void setToNurseUserId(String toNurseUserId) { this.toNurseUserId = toNurseUserId; }
    public Long getPatientAssignmentId() { return patientAssignmentId; }
    public void setPatientAssignmentId(Long patientAssignmentId) { this.patientAssignmentId = patientAssignmentId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(String pendingTasks) { this.pendingTasks = pendingTasks; }
    public String getImportantObservations() { return importantObservations; }
    public void setImportantObservations(String importantObservations) { this.importantObservations = importantObservations; }
    public String getPendingInvestigations() { return pendingInvestigations; }
    public void setPendingInvestigations(String pendingInvestigations) { this.pendingInvestigations = pendingInvestigations; }
    public String getPendingMedicationActions() { return pendingMedicationActions; }
    public void setPendingMedicationActions(String pendingMedicationActions) { this.pendingMedicationActions = pendingMedicationActions; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getAcknowledledgedAt() { return acknowledgedAt; }
    public void setAcknowledledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
