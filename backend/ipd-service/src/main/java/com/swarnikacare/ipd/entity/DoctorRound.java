package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity @Table(name = "doctor_rounds") @Data
public class DoctorRound {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long admissionId;
    private Long doctorId;
    private Long hospitalId;
    private LocalDateTime roundDate = LocalDateTime.now();
    private String clinicalNotes;
    private String diagnosisUpdate;
    private String plan;
}