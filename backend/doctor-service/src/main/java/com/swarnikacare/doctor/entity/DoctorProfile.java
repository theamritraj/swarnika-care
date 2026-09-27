package com.swarnikacare.doctor.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "doctor_profiles")
@Getter
@Setter
@NoArgsConstructor
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

}
