package com.swarnikacare.doctor.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorDirectoryResponse {

    private Long id;
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private String status;

    // Professional profile summary
    private String bio;
    private String qualifications;
    private String specialization;
    private String registrationNumber;
    private Integer experienceYears;
    private String profilePictureUrl;
    private Double defaultConsultationFee;
    private String profileStatus;

    // Hospital assignments
    private List<DoctorAssignmentResponse> assignments = new ArrayList<>();

}
