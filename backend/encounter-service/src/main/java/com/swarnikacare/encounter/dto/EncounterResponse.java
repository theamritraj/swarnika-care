package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.EncounterSource;
import com.swarnikacare.encounter.entity.EncounterStatus;
import com.swarnikacare.encounter.entity.EncounterType;
import java.time.LocalDateTime;

public class EncounterResponse {
    private Long id;
    private String encounterNumber;
    private Long patientId;
    private Long hospitalId;
    private Long departmentId;
    private Long doctorId;
    private EncounterType encounterType;
    private EncounterStatus status;
    private Long appointmentId;
    private EncounterSource source;
    private String chiefComplaint;
    private String notes;
    private String primaryDiagnosis;
    private String secondaryDiagnosis;
    private String clinicalNotes;
    private String treatmentPlan;
    private java.time.LocalDate followUpDate;
    private String followUpNotes;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EncounterResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEncounterNumber() { return encounterNumber; }
    public void setEncounterNumber(String encounterNumber) { this.encounterNumber = encounterNumber; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public EncounterType getEncounterType() { return encounterType; }
    public void setEncounterType(EncounterType encounterType) { this.encounterType = encounterType; }
    public EncounterStatus getStatus() { return status; }
    public void setStatus(EncounterStatus status) { this.status = status; }
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public EncounterSource getSource() { return source; }
    public void setSource(EncounterSource source) { this.source = source; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPrimaryDiagnosis() { return primaryDiagnosis; }
    public void setPrimaryDiagnosis(String primaryDiagnosis) { this.primaryDiagnosis = primaryDiagnosis; }
    public String getSecondaryDiagnosis() { return secondaryDiagnosis; }
    public void setSecondaryDiagnosis(String secondaryDiagnosis) { this.secondaryDiagnosis = secondaryDiagnosis; }
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }
    public java.time.LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(java.time.LocalDate followUpDate) { this.followUpDate = followUpDate; }
    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
