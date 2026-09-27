package com.swarnikacare.doctor.dto;

import com.swarnikacare.doctor.entity.PublicProfileStatus;
import java.time.LocalDateTime;

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

    public DoctorProfileResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
    public String getSpecializations() { return specializations; }
    public void setSpecializations(String specializations) { this.specializations = specializations; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public Double getDefaultConsultationFee() { return defaultConsultationFee; }
    public void setDefaultConsultationFee(Double defaultConsultationFee) { this.defaultConsultationFee = defaultConsultationFee; }
    public PublicProfileStatus getStatus() { return status; }
    public void setStatus(PublicProfileStatus status) { this.status = status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}
