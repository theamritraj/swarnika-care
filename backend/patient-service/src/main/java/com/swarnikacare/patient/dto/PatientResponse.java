package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.Gender;
import com.swarnikacare.patient.entity.PatientStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PatientResponse {
    private Long id;
    private String mrn;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String emergencyContact;
    private String userId;
    private Gender gender;
    private String address;
    private PatientStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PatientResponse(Long id, String firstName, String lastName, String email, String phone, LocalDate dateOfBirth, String bloodGroup, String emergencyContact) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.bloodGroup = bloodGroup;
        this.emergencyContact = emergencyContact;
    }

}
