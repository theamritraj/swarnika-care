-- Migration V3: Add Patient Administrative Documents

CREATE TABLE patient_documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    document_number VARCHAR(64) NOT NULL,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    document_type ENUM('NATIONAL_ID_PROOF', 'INSURANCE_CARD', 'REFERRAL_LETTER', 'DISCHARGE_SUMMARY', 'CONSENT_FORM', 'OTHER') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    status ENUM('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    received_date DATE NOT NULL,
    verified_by VARCHAR(100) NULL,
    notes TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_doc_number (document_number),
    INDEX idx_doc_patient (patient_id),
    INDEX idx_doc_hospital (hospital_id),
    INDEX idx_doc_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
