package com.swarnikacare.nursing.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "vitals")
public class Vitals {
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
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    
    private BigDecimal temperature;
    private Integer pulse;
    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;
    @Column(name = "systolic_bp")
    private Integer systolicBp;
    @Column(name = "diastolic_bp")
    private Integer diastolicBp;
    @Column(name = "oxygen_saturation")
    private Integer oxygenSaturation;
    @Column(name = "blood_glucose")
    private BigDecimal bloodGlucose;
    private BigDecimal weight;
    private BigDecimal height;
    @Column(name = "pain_score")
    private Integer painScore;
    @Column(name = "consciousness_state", length = 100)
    private String consciousnessState;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();
    @Column(name = "recorded_by", nullable = false, length = 100)
    private String recordedBy;

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
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }
}
