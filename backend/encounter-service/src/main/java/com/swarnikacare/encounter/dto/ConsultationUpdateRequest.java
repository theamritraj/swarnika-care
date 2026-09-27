package com.swarnikacare.encounter.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class ConsultationUpdateRequest {
    private String chiefComplaint;
    private String primaryDiagnosis;
    private String secondaryDiagnosis;
    private String clinicalNotes;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String followUpNotes;

}
