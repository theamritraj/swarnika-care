package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;

public class NursingAssessmentDto {
    @NotNull private Long patientId;
    @NotNull private Long admissionId;
    
    private String generalCondition;
    private String consciousness;
    private String painAssessment;
    private String mobility;
    private String fallRisk;
    private String nutrition;
    private String skinAssessment;
    private String elimination;
    private Boolean allergyAwarenessFlag = false;
    private String nursingObservations;
    private String assessmentStatus = "DRAFT";

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
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
}
