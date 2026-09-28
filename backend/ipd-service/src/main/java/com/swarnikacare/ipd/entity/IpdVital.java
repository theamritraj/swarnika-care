package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity @Table(name = "ipd_vitals") @Data
public class IpdVital {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long admissionId;
    private Long patientId;
    private Long hospitalId;
    private Long recordedBy;
    private BigDecimal temperature;
    private Integer heartRate;
    private String bloodPressure;
    private Integer respiratoryRate;
    private Integer oxygenSaturation;
    private String notes;
    private LocalDateTime recordedAt = LocalDateTime.now();
}