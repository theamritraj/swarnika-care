package com.swarnikacare.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "receipts")
@Getter
@Setter
@NoArgsConstructor
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", nullable = false, unique = true)
    private String receiptNumber;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
