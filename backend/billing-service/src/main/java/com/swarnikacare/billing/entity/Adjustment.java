package com.swarnikacare.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "adjustments")
@Getter
@Setter
@NoArgsConstructor
public class Adjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "reason", nullable = false, length = 512)
    private String reason;

    @Column(name = "actor", nullable = false)
    private String actor;

    @Column(name = "original_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal originalBalance = BigDecimal.ZERO;

    @Column(name = "resulting_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal resultingBalance = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
