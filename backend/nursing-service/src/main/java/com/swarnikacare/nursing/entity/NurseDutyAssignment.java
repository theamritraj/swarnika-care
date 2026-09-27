package com.swarnikacare.nursing.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "nurse_duty_assignments", uniqueConstraints = {@UniqueConstraint(columnNames = {"nurse_user_id", "roster_id"})})
public class NurseDutyAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "roster_id", nullable = false)
    private Long rosterId;
    @Column(name = "nurse_user_id", nullable = false, length = 100)
    private String nurseUserId;
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    @Column(name = "unit_id", nullable = false)
    private Long unitId;
    @Column(name = "shift_template_id", nullable = false)
    private Long shiftTemplateId;
    @Column(name = "assignment_status", length = 50)
    private String assignmentStatus = "ASSIGNED";
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt = LocalDateTime.now();
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public Long getShiftTemplateId() { return shiftTemplateId; }
    public void setShiftTemplateId(Long shiftTemplateId) { this.shiftTemplateId = shiftTemplateId; }
    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
