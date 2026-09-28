package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PatientCreateRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid phone number")
    private String phone;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String bloodGroup;

    private String emergencyContact;

    private Gender gender;

    private String address;

    private Long hospitalId; // Optional: register at hospital on creation

    private String iamUserId; // Optional: link to a pre-existing IAM userId (e.g. patient self-registered first)
    public String getIamUserId() { return iamUserId; }
    public void setIamUserId(String iamUserId) { this.iamUserId = iamUserId; }

    public PatientCreateRequest(String firstName, String lastName, String email, String phone, LocalDate dateOfBirth, String bloodGroup, String emergencyContact) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.bloodGroup = bloodGroup;
        this.emergencyContact = emergencyContact;
    }

}
