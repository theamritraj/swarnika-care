package com.swarnikacare.nursing.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "rosters", uniqueConstraints = {@UniqueConstraint(columnNames = {"hospital_id", "unit_id", "roster_date", "shift_template_id"})})
public class Roster {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "roster_date", nullable = false)
    private LocalDate rosterDate;
    @Column(name = "shift_template_id", nullable = false)
    private Long shiftTemplateId;
    @Column(length = 50)
    private String status = "DRAFT";
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public LocalDate getRosterDate() { return rosterDate; }
    public void setRosterDate(LocalDate rosterDate) { this.rosterDate = rosterDate; }
    public Long getShiftTemplateId() { return shiftTemplateId; }
    public void setShiftTemplateId(Long shiftTemplateId) { this.shiftTemplateId = shiftTemplateId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
