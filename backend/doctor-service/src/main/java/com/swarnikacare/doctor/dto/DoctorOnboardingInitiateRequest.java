package com.swarnikacare.doctor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;

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

    public DoctorOnboardingInitiateRequest() {}

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public BigDecimal getDefaultConsultationFee() { return defaultConsultationFee; }
    public void setDefaultConsultationFee(BigDecimal defaultConsultationFee) { this.defaultConsultationFee = defaultConsultationFee; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public Boolean getPublicAppointmentEnabled() { return publicAppointmentEnabled; }
    public void setPublicAppointmentEnabled(Boolean publicAppointmentEnabled) { this.publicAppointmentEnabled = publicAppointmentEnabled; }

    public Boolean getInHouseClinicalEnabled() { return inHouseClinicalEnabled; }
    public void setInHouseClinicalEnabled(Boolean inHouseClinicalEnabled) { this.inHouseClinicalEnabled = inHouseClinicalEnabled; }
}
