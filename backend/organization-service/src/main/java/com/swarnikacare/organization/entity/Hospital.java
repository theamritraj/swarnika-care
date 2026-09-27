package com.swarnikacare.organization.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public HospitalType getType() { return type; }
    public void setType(HospitalType type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getEmergencyPhone() { return emergencyPhone; }
    public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Integer getTotalBeds() { return totalBeds; }
    public void setTotalBeds(Integer totalBeds) { this.totalBeds = totalBeds; }
    public Integer getIcuBeds() { return icuBeds; }
    public void setIcuBeds(Integer icuBeds) { this.icuBeds = icuBeds; }
    public Integer getNicuBeds() { return nicuBeds; }
    public void setNicuBeds(Integer nicuBeds) { this.nicuBeds = nicuBeds; }
    public Integer getEmergencyBeds() { return emergencyBeds; }
    public void setEmergencyBeds(Integer emergencyBeds) { this.emergencyBeds = emergencyBeds; }
    public Boolean getEmergencyAvailable() { return emergencyAvailable; }
    public void setEmergencyAvailable(Boolean emergencyAvailable) { this.emergencyAvailable = emergencyAvailable; }
    public Boolean getOtAvailable() { return otAvailable; }
    public void setOtAvailable(Boolean otAvailable) { this.otAvailable = otAvailable; }
    public Boolean getBloodBankAvailable() { return bloodBankAvailable; }
    public void setBloodBankAvailable(Boolean bloodBankAvailable) { this.bloodBankAvailable = bloodBankAvailable; }
    public Boolean getAmbulanceAvailable() { return ambulanceAvailable; }
    public void setAmbulanceAvailable(Boolean ambulanceAvailable) { this.ambulanceAvailable = ambulanceAvailable; }
    public Boolean getNicuAvailable() { return nicuAvailable; }
    public void setNicuAvailable(Boolean nicuAvailable) { this.nicuAvailable = nicuAvailable; }
    public String getClinicalServices() { return clinicalServices; }
    public void setClinicalServices(String clinicalServices) { this.clinicalServices = clinicalServices; }
    public String getLaboratoryService() { return laboratoryService; }
    public void setLaboratoryService(String laboratoryService) { this.laboratoryService = laboratoryService; }
    public String getBloodBankService() { return bloodBankService; }
    public void setBloodBankService(String bloodBankService) { this.bloodBankService = bloodBankService; }
    public String getPharmacyService() { return pharmacyService; }
    public void setPharmacyService(String pharmacyService) { this.pharmacyService = pharmacyService; }
    public String getRadiologyService() { return radiologyService; }
    public void setRadiologyService(String radiologyService) { this.radiologyService = radiologyService; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
