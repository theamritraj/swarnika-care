package com.swarnikacare.organization.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class FloorRequest {
    private Long hospitalId;
    private Long buildingId;
    private Integer floorNumber;
    private String code;
    private String name;
    private String description;
    private String status;

}
