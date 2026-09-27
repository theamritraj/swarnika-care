package com.swarnikacare.doctor.dto;

public class DoctorProfileRequest {
    private String bio;
    private String qualifications;
    private String specializations;
    private String registrationNumber;
    private Integer experienceYears;
    private String profilePictureUrl;
    private Double defaultConsultationFee;

    public DoctorProfileRequest() {}

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
}
