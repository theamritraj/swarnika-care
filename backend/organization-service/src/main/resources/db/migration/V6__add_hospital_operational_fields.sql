ALTER TABLE hospitals
ADD COLUMN nicu_beds INT,
ADD COLUMN emergency_beds INT,
ADD COLUMN nicu_available BOOLEAN,
ADD COLUMN clinical_services TEXT,
ADD COLUMN laboratory_service VARCHAR(50),
ADD COLUMN blood_bank_service VARCHAR(50),
ADD COLUMN pharmacy_service VARCHAR(50),
ADD COLUMN radiology_service VARCHAR(50);
