package com.swarnikacare.doctor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorOnboardingInitiateRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String gender;
    private LocalDate dateOfBirth;

    private String specialization;
    private String qualifications;
    private Integer experienceYears;
    private String registrationNumber;
    private BigDecimal defaultConsultationFee;
    private String bio;

    private Long hospitalId;
    private Long departmentId;
    private String designation = "Consultant";

    private Boolean publicAppointmentEnabled = false;
    private Boolean inHouseClinicalEnabled = true;

}
