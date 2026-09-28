package com.swarnikacare.nursing.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nursing_assessments")
public class NursingAssessment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "patient_id", nullable = false)
    private Long patientId;
    @Column(name = "admission_id", nullable = false)
    private Long admissionId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "general_condition", length = 100)
    private String generalCondition;
    @Column(length = 100)
    private String consciousness;
    @Column(name = "pain_assessment", length = 100)
    private String painAssessment;
    @Column(length = 100)
    private String mobility;
    @Column(name = "fall_risk", length = 100)
    private String fallRisk;
    @Column(length = 100)
    private String nutrition;
    @Column(name = "skin_assessment", length = 100)
    private String skinAssessment;
    @Column(length = 100)
    private String elimination;
    @Column(name = "allergy_awareness_flag")
    private Boolean allergyAwarenessFlag = false;
    @Column(name = "nursing_observations", columnDefinition = "TEXT")
    private String nursingObservations;
    @Column(name = "assessment_status", length = 50)
    private String assessmentStatus = "DRAFT";
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;
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
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getGeneralCondition() { return generalCondition; }
    public void setGeneralCondition(String generalCondition) { this.generalCondition = generalCondition; }
    public String getConsciousness() { return consciousness; }
    public void setConsciousness(String consciousness) { this.consciousness = consciousness; }
    public String getPainAssessment() { return painAssessment; }
    public void setPainAssessment(String painAssessment) { this.painAssessment = painAssessment; }
    public String getMobility() { return mobility; }
    public void setMobility(String mobility) { this.mobility = mobility; }
    public String getFallRisk() { return fallRisk; }
    public void setFallRisk(String fallRisk) { this.fallRisk = fallRisk; }
    public String getNutrition() { return nutrition; }
    public void setNutrition(String nutrition) { this.nutrition = nutrition; }
    public String getSkinAssessment() { return skinAssessment; }
    public void setSkinAssessment(String skinAssessment) { this.skinAssessment = skinAssessment; }
    public String getElimination() { return elimination; }
    public void setElimination(String elimination) { this.elimination = elimination; }
    public Boolean getAllergyAwarenessFlag() { return allergyAwarenessFlag; }
    public void setAllergyAwarenessFlag(Boolean allergyAwarenessFlag) { this.allergyAwarenessFlag = allergyAwarenessFlag; }
    public String getNursingObservations() { return nursingObservations; }
    public void setNursingObservations(String nursingObservations) { this.nursingObservations = nursingObservations; }
    public String getAssessmentStatus() { return assessmentStatus; }
    public void setAssessmentStatus(String assessmentStatus) { this.assessmentStatus = assessmentStatus; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
