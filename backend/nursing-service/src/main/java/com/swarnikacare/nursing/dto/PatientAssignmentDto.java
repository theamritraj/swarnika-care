package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;

public class PatientAssignmentDto {
    @NotNull
    private Long admissionId;
    @NotNull
    private Long patientId;
    @NotNull
    private Long unitId;
    @NotNull
    private Long roomId;
    @NotNull
    private Long bedId;
    private Long rosterId;

    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public Long getBedId() { return bedId; }
    public void setBedId(Long bedId) { this.bedId = bedId; }
    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
}
