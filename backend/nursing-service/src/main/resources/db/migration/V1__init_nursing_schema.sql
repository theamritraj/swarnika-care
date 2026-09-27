CREATE TABLE shift_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_shift_hospital_code (hospital_id, code)
);

CREATE TABLE rosters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    roster_date DATE NOT NULL,
    shift_template_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_template_id) REFERENCES shift_templates(id),
    UNIQUE KEY uk_roster_hospital_unit_date_shift (hospital_id, unit_id, roster_date, shift_template_id)
);

CREATE TABLE nurse_duty_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roster_id BIGINT NOT NULL,
    nurse_user_id VARCHAR(100) NOT NULL,
    hospital_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    shift_template_id BIGINT NOT NULL,
    assignment_status VARCHAR(50) DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (roster_id) REFERENCES rosters(id),
    FOREIGN KEY (shift_template_id) REFERENCES shift_templates(id),
    UNIQUE KEY uk_duty_nurse_roster (nurse_user_id, roster_id)
);

CREATE TABLE patient_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    bed_id BIGINT NOT NULL,
    admission_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    nurse_user_id VARCHAR(100) NOT NULL,
    roster_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    assignment_notes TEXT,
    created_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (roster_id) REFERENCES rosters(id),
    INDEX idx_pa_hospital (hospital_id),
    INDEX idx_pa_nurse (nurse_user_id),
    INDEX idx_pa_admission (admission_id),
    INDEX idx_pa_status (status)
);

CREATE TABLE vitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    admission_id BIGINT NOT NULL,
    encounter_id BIGINT,
    hospital_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    temperature DECIMAL(5, 2),
    pulse INT,
    respiratory_rate INT,
    systolic_bp INT,
    diastolic_bp INT,
    oxygen_saturation INT,
    blood_glucose DECIMAL(5, 2),
    weight DECIMAL(5, 2),
    height DECIMAL(5, 2),
    pain_score INT,
    consciousness_state VARCHAR(100),
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(100) NOT NULL,
    INDEX idx_vitals_patient (patient_id),
    INDEX idx_vitals_admission (admission_id)
);

CREATE TABLE nursing_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    admission_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    general_condition VARCHAR(100),
    consciousness VARCHAR(100),
    pain_assessment VARCHAR(100),
    mobility VARCHAR(100),
    fall_risk VARCHAR(100),
    nutrition VARCHAR(100),
    skin_assessment VARCHAR(100),
    elimination VARCHAR(100),
    allergy_awareness_flag BOOLEAN DEFAULT FALSE,
    nursing_observations TEXT,
    assessment_status VARCHAR(50) DEFAULT 'DRAFT',
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assess_patient (patient_id),
    INDEX idx_assess_admission (admission_id)
);

CREATE TABLE nursing_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    admission_id BIGINT NOT NULL,
    encounter_id BIGINT,
    hospital_id BIGINT NOT NULL,
    nurse_user_id VARCHAR(100) NOT NULL,
    note_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'FINAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notes_patient (patient_id),
    INDEX idx_notes_admission (admission_id),
    INDEX idx_notes_nurse (nurse_user_id)
);

CREATE TABLE care_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    admission_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    assigned_nurse_user_id VARCHAR(100),
    task_type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'ROUTINE',
    status VARCHAR(50) DEFAULT 'PENDING',
    scheduled_at TIMESTAMP,
    due_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_patient (patient_id),
    INDEX idx_task_admission (admission_id),
    INDEX idx_task_status (status),
    INDEX idx_task_scheduled (scheduled_at)
);

CREATE TABLE shift_handovers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    roster_id BIGINT NOT NULL,
    from_nurse_user_id VARCHAR(100) NOT NULL,
    to_nurse_user_id VARCHAR(100) NOT NULL,
    patient_assignment_id BIGINT,
    admission_id BIGINT NOT NULL,
    summary TEXT,
    pending_tasks TEXT,
    important_observations TEXT,
    pending_investigations TEXT,
    pending_medication_actions TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roster_id) REFERENCES rosters(id),
    FOREIGN KEY (patient_assignment_id) REFERENCES patient_assignments(id),
    INDEX idx_handover_hospital_unit (hospital_id, unit_id),
    INDEX idx_handover_from_nurse (from_nurse_user_id),
    INDEX idx_handover_to_nurse (to_nurse_user_id)
);

CREATE TABLE medication_administration_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    admission_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    nurse_user_id VARCHAR(100) NOT NULL,
    medication_order_id BIGINT NOT NULL,
    scheduled_at TIMESTAMP,
    administered_at TIMESTAMP,
    dose_administered VARCHAR(100),
    route VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mar_patient (patient_id),
    INDEX idx_mar_admission (admission_id),
    INDEX idx_mar_nurse (nurse_user_id),
    INDEX idx_mar_status (status)
);
