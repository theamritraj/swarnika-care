-- Migration V2: Add Clinical Consultation, Prescriptions, and Orders

ALTER TABLE encounters
    ADD COLUMN primary_diagnosis VARCHAR(255) NULL AFTER notes,
    ADD COLUMN secondary_diagnosis VARCHAR(255) NULL AFTER primary_diagnosis,
    ADD COLUMN clinical_notes TEXT NULL AFTER secondary_diagnosis,
    ADD COLUMN treatment_plan TEXT NULL AFTER clinical_notes,
    ADD COLUMN follow_up_date DATE NULL AFTER treatment_plan,
    ADD COLUMN follow_up_notes VARCHAR(500) NULL AFTER follow_up_date;

CREATE TABLE prescriptions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    prescription_number VARCHAR(30) NOT NULL,
    encounter_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    notes TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_prescription_number (prescription_number),
    INDEX idx_presc_encounter (encounter_id),
    INDEX idx_presc_patient (patient_id),
    INDEX idx_presc_doctor (doctor_id),
    INDEX idx_presc_hospital (hospital_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE prescription_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    prescription_id BIGINT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    route VARCHAR(50) NULL,
    instructions VARCHAR(255) NULL,
    PRIMARY KEY (id),
    INDEX idx_item_presc (prescription_id),
    CONSTRAINT fk_prescription_items_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE clinical_orders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_number VARCHAR(30) NOT NULL,
    encounter_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    order_type ENUM('LAB', 'IMAGING') NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'ROUTINE',
    clinical_indication VARCHAR(500) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ORDERED',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_number (order_number),
    INDEX idx_order_encounter (encounter_id),
    INDEX idx_order_patient (patient_id),
    INDEX idx_order_doctor (doctor_id),
    INDEX idx_order_hospital (hospital_id),
    INDEX idx_order_type (order_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
