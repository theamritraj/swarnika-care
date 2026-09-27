package com.swarnikacare.doctor.dto;

import com.swarnikacare.doctor.entity.PublicProfileStatus;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorProfileResponse {
    private Long id;
    private Long doctorId;
    private String bio;
    private String qualifications;
    private String specializations;
    private String registrationNumber;
    private Integer experienceYears;
    private String profilePictureUrl;
    private Double defaultConsultationFee;
    private PublicProfileStatus status;
    private LocalDateTime updatedAt;
    
    // Additional fields from Doctor entity for public endpoint
    private String firstName;
    private String lastName;

}
