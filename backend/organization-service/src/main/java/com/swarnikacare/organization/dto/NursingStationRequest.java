package com.swarnikacare.organization.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class NursingStationRequest {
    private Long hospitalId;
    private Long buildingId;
    private Long floorId;
    private Long unitId;
    private String code;
    private String name;
    private String description;
    private String location;
    private String status;

}
