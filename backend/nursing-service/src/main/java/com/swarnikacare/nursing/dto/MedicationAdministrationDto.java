package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class MedicationAdministrationDto {
    @NotNull private Long patientId;
    @NotNull private Long admissionId;
    @NotNull private Long prescriptionId;
    @NotNull private String status; // ADMINISTERED, HELD, MISSED, REFUSED
    private String reason;
    private LocalDateTime administeredAt;
    private String doseAdministered;
    private String route;
    private String notes;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Long prescriptionId) { this.prescriptionId = prescriptionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getAdministeredAt() { return administeredAt; }
    public void setAdministeredAt(LocalDateTime administeredAt) { this.administeredAt = administeredAt; }
    public String getDoseAdministered() { return doseAdministered; }
    public void setDoseAdministered(String doseAdministered) { this.doseAdministered = doseAdministered; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
