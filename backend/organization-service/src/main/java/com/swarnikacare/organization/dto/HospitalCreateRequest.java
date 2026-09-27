package com.swarnikacare.organization.dto;

import com.swarnikacare.organization.entity.HospitalType;
import jakarta.validation.constraints.NotBlank;

public class HospitalCreateRequest {
    @NotBlank(message = "Hospital code is required")
    private String code;
    @NotBlank(message = "Hospital name is required")
    private String name;
    private HospitalType type;
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
    private Boolean emergencyAvailable = false;
    private Boolean otAvailable = false;
    private Boolean bloodBankAvailable = false;
    private Boolean ambulanceAvailable = false;
    private Boolean nicuAvailable = false;
    private String clinicalServices;
    private String laboratoryService;
    private String bloodBankService;
    private String pharmacyService;
    private String radiologyService;

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
}
