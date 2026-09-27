package com.swarnikacare.encounter.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class OpdEncounterRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Doctor ID is required for OPD encounter")
    private Long doctorId;

    private Long appointmentId;

    private String chiefComplaint;

    private String notes;

}
