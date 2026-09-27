package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VitalsDto {
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    @NotNull(message = "Admission ID is required")
    private Long admissionId;
    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;
    @NotNull(message = "Unit ID is required")
    private Long unitId;

    private BigDecimal temperature;
    private Integer pulse;
    private Integer respiratoryRate;
    private Integer systolicBp;
    private Integer diastolicBp;
    private Integer oxygenSaturation;
    private BigDecimal bloodGlucose;
    private BigDecimal weight;
    private BigDecimal height;
    private Integer painScore;
    private String consciousnessState;
    private String notes;

    // Getters and Setters omitted for brevity in this script, will be managed by Lombok if enabled, or manually.
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public Integer getPulse() { return pulse; }
    public void setPulse(Integer pulse) { this.pulse = pulse; }
    public Integer getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(Integer respiratoryRate) { this.respiratoryRate = respiratoryRate; }
    public Integer getSystolicBp() { return systolicBp; }
    public void setSystolicBp(Integer systolicBp) { this.systolicBp = systolicBp; }
    public Integer getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(Integer diastolicBp) { this.diastolicBp = diastolicBp; }
    public Integer getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(Integer oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }
    public BigDecimal getBloodGlucose() { return bloodGlucose; }
    public void setBloodGlucose(BigDecimal bloodGlucose) { this.bloodGlucose = bloodGlucose; }
    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }
    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }
    public Integer getPainScore() { return painScore; }
    public void setPainScore(Integer painScore) { this.painScore = painScore; }
    public String getConsciousnessState() { return consciousnessState; }
    public void setConsciousnessState(String consciousnessState) { this.consciousnessState = consciousnessState; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
