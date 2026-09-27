package com.swarnikacare.patient.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "patient_documents")
@Getter
@Setter
@NoArgsConstructor
public class PatientDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_number", nullable = false, unique = true, length = 64)
    private String documentNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private PatientDocumentType documentType;

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PatientDocumentStatus status = PatientDocumentStatus.PENDING_VERIFICATION;

    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
