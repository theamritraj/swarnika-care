package com.swarnikacare.encounter.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class EmergencyEncounterRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long doctorId; // Optional in emergency triage

    private String chiefComplaint;

    private String notes;

}
