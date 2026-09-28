CREATE TABLE patient_newborn_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE,
    mother_id BIGINT NOT NULL,
    birth_weight_kg DOUBLE,
    gestational_age_weeks INT,
    delivery_method VARCHAR(50),
    time_of_birth TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_newborn_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_newborn_mother FOREIGN KEY (mother_id) REFERENCES patients(id)
);
