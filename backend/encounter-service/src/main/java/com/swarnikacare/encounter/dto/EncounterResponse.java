package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.EncounterSource;
import com.swarnikacare.encounter.entity.EncounterStatus;
import com.swarnikacare.encounter.entity.EncounterType;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class EncounterResponse {
    private Long id;
    private String encounterNumber;
    private Long patientId;
    private Long hospitalId;
    private Long departmentId;
    private Long doctorId;
    private EncounterType encounterType;
    private EncounterStatus status;
    private Long appointmentId;
    private EncounterSource source;
    private String chiefComplaint;
    private String notes;
    private String primaryDiagnosis;
    private String secondaryDiagnosis;
    private String clinicalNotes;
    private String treatmentPlan;
    private java.time.LocalDate followUpDate;
    private String followUpNotes;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public java.time.LocalDate getFollowUpDate() { return followUpDate; }

}
