package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.EncounterSource;
import com.swarnikacare.encounter.entity.EncounterType;
import jakarta.validation.constraints.NotNull;

public class EncounterCreateRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long doctorId;

    @NotNull(message = "Encounter type is required")
    private EncounterType encounterType;

    private Long appointmentId;

    private EncounterSource source;

    private String chiefComplaint;

    private String notes;

    public EncounterCreateRequest() {}

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
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public EncounterSource getSource() { return source; }
    public void setSource(EncounterSource source) { this.source = source; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
