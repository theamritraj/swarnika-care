CREATE TABLE lab_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_code VARCHAR(50) NOT NULL UNIQUE,
    test_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    specimen_type VARCHAR(100) NOT NULL,
    turnaround_time_mins INT,
    is_active BOOLEAN DEFAULT TRUE,
    hospital_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_test_hospital (hospital_id)
);

CREATE TABLE lab_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    clinical_order_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    encounter_id BIGINT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lab_order_clinical (clinical_order_id),
    INDEX idx_lab_order_patient (patient_id),
    INDEX idx_lab_order_hospital (hospital_id)
);

CREATE TABLE lab_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_order_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_order_id) REFERENCES lab_orders(id),
    FOREIGN KEY (test_id) REFERENCES lab_tests(id)
);

CREATE TABLE specimens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    accession_number VARCHAR(50) NOT NULL UNIQUE,
    lab_order_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    specimen_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    collected_by BIGINT,
    collected_at TIMESTAMP,
    received_at TIMESTAMP,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_order_id) REFERENCES lab_orders(id),
    INDEX idx_specimen_accession (accession_number),
    INDEX idx_specimen_patient (patient_id)
);

CREATE TABLE lab_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_order_item_id BIGINT NOT NULL,
    specimen_id BIGINT,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    result_type VARCHAR(20) NOT NULL,
    numeric_value DECIMAL(10,4),
    text_value TEXT,
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    abnormal_flag VARCHAR(20),
    comments TEXT,
    status VARCHAR(50) NOT NULL,
    entered_by BIGINT NOT NULL,
    verified_by BIGINT,
    verified_at TIMESTAMP,
    released_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_order_item_id) REFERENCES lab_order_items(id),
    FOREIGN KEY (specimen_id) REFERENCES specimens(id),
    INDEX idx_result_patient (patient_id),
    INDEX idx_result_hospital (hospital_id)
);
