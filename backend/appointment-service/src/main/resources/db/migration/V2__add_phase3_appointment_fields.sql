ALTER TABLE appointments CHANGE COLUMN appointment_time appointment_date DATE NOT NULL;
ALTER TABLE appointments ADD COLUMN appointment_number VARCHAR(50) NOT NULL UNIQUE;
ALTER TABLE appointments ADD COLUMN hospital_id BIGINT NOT NULL;
ALTER TABLE appointments ADD COLUMN department_id BIGINT NOT NULL;
ALTER TABLE appointments ADD COLUMN appointment_type VARCHAR(50) NOT NULL;
ALTER TABLE appointments ADD COLUMN booking_source VARCHAR(50) NOT NULL;
ALTER TABLE appointments ADD COLUMN notes TEXT;
ALTER TABLE appointments ADD COLUMN cancellation_reason VARCHAR(255);
ALTER TABLE appointments ADD COLUMN cancelled_at DATETIME(6);
ALTER TABLE appointments ADD COLUMN completed_at DATETIME(6);
ALTER TABLE appointments ADD COLUMN created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE appointments ADD COLUMN updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_appointments_doctor_date ON appointments (doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date);
CREATE INDEX idx_appointments_hospital_date ON appointments (hospital_id, appointment_date);
CREATE INDEX idx_appointments_department_date ON appointments (department_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments (status);

CREATE TABLE doctor_schedule_locks (
    doctor_id BIGINT PRIMARY KEY,
    last_updated DATETIME(6) NOT NULL
);
