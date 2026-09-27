package com.swarnikacare.patient.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PatientHospitalRegistrationRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    private LocalDate registrationDate;

    public PatientHospitalRegistrationRequest() {}

    public PatientHospitalRegistrationRequest(Long hospitalId, LocalDate registrationDate) {
        this.hospitalId = hospitalId;
        this.registrationDate = registrationDate;
    }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }
}
