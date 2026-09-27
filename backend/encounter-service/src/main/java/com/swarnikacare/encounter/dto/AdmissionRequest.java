package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.AdmissionType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class AdmissionRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Admitting Doctor ID is required")
    private Long admittingDoctorId;

    private LocalDate admissionDate;
    private LocalTime admissionTime;
    private AdmissionType admissionType = AdmissionType.ELECTIVE;
    private Long wardId;
    private Long roomId;
    private Long bedId;

    @NotNull(message = "Admission reason is required")
    private String reason;

    private String notes;

}
