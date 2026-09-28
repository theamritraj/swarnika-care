package com.swarnikacare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class RegisterNewbornRequest {
    @NotNull private Long motherId;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String gender;
    @NotNull private LocalDate dateOfBirth;
    
    private Double birthWeightKg;
    private Integer gestationalAgeWeeks;
    private String deliveryMethod;
    @NotNull private LocalDateTime timeOfBirth;
}
