package com.swarnikacare.organization.dto;

import com.swarnikacare.organization.enums.UnitType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class UnitRequest {
    private Long hospitalId;
    private Long buildingId;
    private Long floorId;
    private Long departmentId;
    private String code;
    private String name;
    private UnitType type;
    private String description;
    private Integer capacity;
    private String genderRestriction;
    private String ageGroup;
    private String status;
    private Boolean publicVisibility;

}
