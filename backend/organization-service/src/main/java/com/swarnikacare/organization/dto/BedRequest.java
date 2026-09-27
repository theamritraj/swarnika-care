package com.swarnikacare.organization.dto;

import com.swarnikacare.organization.enums.BedType;
import com.swarnikacare.organization.enums.BedStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class BedRequest {
    private Long hospitalId;
    private Long buildingId;
    private Long floorId;
    private Long unitId;
    private Long roomId;
    private String bedNumber;
    private BedType bedType;
    private BedStatus status;
    private String genderRestriction;
    private Boolean isIsolation;

}
