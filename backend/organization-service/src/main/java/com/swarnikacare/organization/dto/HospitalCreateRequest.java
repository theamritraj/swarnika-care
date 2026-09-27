package com.swarnikacare.organization.dto;

import com.swarnikacare.organization.entity.HospitalType;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
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

}
