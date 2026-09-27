package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class RosterDto {
    @NotNull private Long hospitalId;
    @NotNull private Long unitId;
    @NotNull private LocalDate rosterDate;
    @NotNull private Long shiftTemplateId;

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public LocalDate getRosterDate() { return rosterDate; }
    public void setRosterDate(LocalDate rosterDate) { this.rosterDate = rosterDate; }
    public Long getShiftTemplateId() { return shiftTemplateId; }
    public void setShiftTemplateId(Long shiftTemplateId) { this.shiftTemplateId = shiftTemplateId; }
}
