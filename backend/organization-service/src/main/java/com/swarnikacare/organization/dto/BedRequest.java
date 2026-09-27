package com.swarnikacare.organization.dto;

import com.swarnikacare.organization.enums.BedType;
import com.swarnikacare.organization.enums.BedStatus;

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

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public Long getFloorId() {
        return floorId;
    }

    public void setFloorId(Long floorId) {
        this.floorId = floorId;
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public BedType getBedType() {
        return bedType;
    }

    public void setBedType(BedType bedType) {
        this.bedType = bedType;
    }

    public BedStatus getStatus() {
        return status;
    }

    public void setStatus(BedStatus status) {
        this.status = status;
    }

    public String getGenderRestriction() {
        return genderRestriction;
    }

    public void setGenderRestriction(String genderRestriction) {
        this.genderRestriction = genderRestriction;
    }

    public Boolean getIsIsolation() {
        return isIsolation;
    }

    public void setIsIsolation(Boolean isIsolation) {
        this.isIsolation = isIsolation;
    }
}
