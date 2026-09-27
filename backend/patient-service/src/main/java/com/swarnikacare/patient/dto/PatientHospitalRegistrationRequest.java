package com.swarnikacare.patient.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PatientHospitalRegistrationRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    private LocalDate registrationDate;

    public PatientHospitalRegistrationRequest(Long hospitalId, LocalDate registrationDate) {
        this.hospitalId = hospitalId;
        this.registrationDate = registrationDate;
    }

}
