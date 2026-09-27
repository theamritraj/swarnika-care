package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.EncounterSource;
import com.swarnikacare.encounter.entity.EncounterType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
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

}
