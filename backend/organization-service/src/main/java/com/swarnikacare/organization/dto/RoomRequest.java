package com.swarnikacare.organization.dto;

import com.swarnikacare.organization.enums.RoomType;
import com.swarnikacare.organization.enums.RoomStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class RoomRequest {
    private Long hospitalId;
    private Long buildingId;
    private Long floorId;
    private Long unitId;
    private String roomNumber;
    private String roomName;
    private RoomType roomType;
    private Integer capacity;
    private String genderRestriction;
    private RoomStatus status;

}
