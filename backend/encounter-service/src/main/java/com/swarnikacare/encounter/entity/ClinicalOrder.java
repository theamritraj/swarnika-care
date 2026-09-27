package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "clinical_orders", indexes = {
        @Index(name = "idx_order_encounter", columnList = "encounter_id"),
        @Index(name = "idx_order_patient", columnList = "patient_id"),
        @Index(name = "idx_order_doctor", columnList = "doctor_id"),
        @Index(name = "idx_order_hospital", columnList = "hospital_id"),
        @Index(name = "idx_order_type", columnList = "order_type")
})
@Getter
@Setter
@NoArgsConstructor
public class ClinicalOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private ClinicalOrderType orderType;

    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(nullable = false, length = 50)
    private String priority = "ROUTINE";

    @Column(name = "clinical_indication", length = 500)
    private String clinicalIndication;

    @Column(nullable = false, length = 50)
    private String status = "ORDERED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (priority == null) priority = "ROUTINE";
        if (status == null) status = "ORDERED";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
