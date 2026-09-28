package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity @Table(name = "discharge_summaries") @Data
public class DischargeSummary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true) private Long admissionId;
    private Long patientId;
    private Long hospitalId;
    private Long dischargingDoctorId;
    private LocalDateTime dischargeDate = LocalDateTime.now();
    private String dischargeStatus;
    private String clinicalCourse;
    private String dischargeCondition;
    private String followUpInstructions;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}