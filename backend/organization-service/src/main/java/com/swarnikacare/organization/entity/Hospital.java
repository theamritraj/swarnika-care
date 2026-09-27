package com.swarnikacare.organization.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String code;
    @Column(nullable = false)
    private String name;
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(255)")
    private HospitalType type;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String phone;
    private String email;
    private String emergencyPhone;
    private String website;
    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private Integer totalBeds;
    private Integer icuBeds;
    private Integer nicuBeds;
    private Integer emergencyBeds;
    private Boolean emergencyAvailable;
    private Boolean otAvailable;
    private Boolean bloodBankAvailable;
    private Boolean ambulanceAvailable;
    private Boolean nicuAvailable;
    
    @Column(columnDefinition = "TEXT")
    private String clinicalServices;
    
    private String laboratoryService;
    private String bloodBankService;
    private String pharmacyService;
    private String radiologyService;
    @Column(nullable = false)
    private String status;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
