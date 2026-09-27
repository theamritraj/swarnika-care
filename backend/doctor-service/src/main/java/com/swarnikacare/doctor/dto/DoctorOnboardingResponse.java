package com.swarnikacare.doctor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorOnboardingResponse {
    private Long doctorId;
    private String doctorName;
    private String email;
    private String hospitalName;
    private String departmentName;
    private String designation;
    private String welcomeEmailStatus;
    private String message;

}
