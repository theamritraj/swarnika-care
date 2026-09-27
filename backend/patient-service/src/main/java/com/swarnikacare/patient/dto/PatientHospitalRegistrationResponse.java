package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.RegistrationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PatientHospitalRegistrationResponse {
    private Long id;
    private Long patientId;
    private Long hospitalId;
    private String registrationNumber;
    private LocalDate registrationDate;
    private RegistrationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
