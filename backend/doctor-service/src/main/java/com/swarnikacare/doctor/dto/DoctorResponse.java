package com.swarnikacare.doctor.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorResponse {
    private Long id;
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private String status;

}
