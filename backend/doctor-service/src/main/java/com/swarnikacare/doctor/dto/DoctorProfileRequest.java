package com.swarnikacare.doctor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorProfileRequest {
    private String bio;
    private String qualifications;
    private String specializations;
    private String registrationNumber;
    private Integer experienceYears;
    private String profilePictureUrl;
    private Double defaultConsultationFee;

}
