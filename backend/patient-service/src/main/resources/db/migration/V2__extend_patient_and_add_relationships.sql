-- Step 1: Add new columns to patients (nullable mrn initially to allow backfill)
ALTER TABLE patients
  ADD COLUMN mrn VARCHAR(20) NULL AFTER id,
  ADD COLUMN gender ENUM('MALE','FEMALE','OTHER','UNSPECIFIED') NULL AFTER emergency_contact,
  ADD COLUMN address VARCHAR(500) NULL AFTER gender,
  ADD COLUMN status ENUM('ACTIVE','INACTIVE','DECEASED') NOT NULL DEFAULT 'ACTIVE' AFTER address,
  ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER status,
  ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at;

-- Step 2: Backfill MRN for existing patients
UPDATE patients SET mrn = CONCAT('MRN-', LPAD(id, 6, '0')) WHERE mrn IS NULL OR mrn = '';

-- Step 3: Make mrn NOT NULL and UNIQUE
ALTER TABLE patients
  MODIFY COLUMN mrn VARCHAR(20) NOT NULL,
  ADD UNIQUE KEY uk_patient_mrn (mrn);

-- Step 4: Create patient_hospital_registrations table
CREATE TABLE patient_hospital_registrations (
  id BIGINT NOT NULL AUTO_INCREMENT,
  patient_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  registration_number VARCHAR(30) NOT NULL,
  registration_date DATE NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_registration_number (registration_number),
  UNIQUE KEY uk_patient_hospital (patient_id, hospital_id),
  INDEX idx_reg_patient (patient_id),
  INDEX idx_reg_hospital (hospital_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Step 5: Create patient_relationships table
CREATE TABLE patient_relationships (
  id BIGINT NOT NULL AUTO_INCREMENT,
  source_patient_id BIGINT NOT NULL,
  target_patient_id BIGINT NOT NULL,
  relationship_type ENUM('MOTHER_OF','FATHER_OF','GUARDIAN_OF','SPOUSE_OF','CHILD_OF','SIBLING_OF') NOT NULL,
  notes VARCHAR(255) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_relationship (source_patient_id, target_patient_id, relationship_type),
  CONSTRAINT chk_no_self_relationship CHECK (source_patient_id != target_patient_id),
  INDEX idx_rel_source (source_patient_id),
  INDEX idx_rel_target (target_patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
