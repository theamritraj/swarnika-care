CREATE TABLE bed_transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    from_bed_id BIGINT,
    to_bed_id BIGINT NOT NULL,
    transfer_reason VARCHAR(255),
    transferred_by BIGINT,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ipd_vitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    recorded_by BIGINT,
    temperature DECIMAL(5,2),
    heart_rate INT,
    blood_pressure VARCHAR(20),
    respiratory_rate INT,
    oxygen_saturation INT,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_rounds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    round_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clinical_notes TEXT,
    diagnosis_update VARCHAR(255),
    plan TEXT
);

CREATE TABLE discharge_summaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    discharging_doctor_id BIGINT NOT NULL,
    discharge_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discharge_status VARCHAR(50),
    clinical_course TEXT,
    discharge_condition TEXT,
    follow_up_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);