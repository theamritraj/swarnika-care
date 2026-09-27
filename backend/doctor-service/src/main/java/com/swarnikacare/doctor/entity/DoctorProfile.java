package com.swarnikacare.doctor.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_profiles")
public class DoctorProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private Long doctorId; // 1-to-1 mapping with Doctor
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String qualifications;
    
    private String specializations; // Comma separated or JSON
    
    private String registrationNumber; // Medical council registration
    
    private Integer experienceYears;
    
    private String profilePictureUrl;
    
    private Double defaultConsultationFee;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PublicProfileStatus status = PublicProfileStatus.DRAFT;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public DoctorProfile() {}

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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
