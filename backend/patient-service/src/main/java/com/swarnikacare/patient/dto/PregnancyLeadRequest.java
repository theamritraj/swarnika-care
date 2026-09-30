package com.swarnikacare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PregnancyLeadRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Mobile is required")
    private String mobile;

    private String email;
    private LocalDate lmpDate;
    private Integer cycleLength;
    private LocalDate estimatedDueDate;
    private Integer estimatedFetalAgeWeeks;
    private Integer estimatedFetalAgeDays;
}
