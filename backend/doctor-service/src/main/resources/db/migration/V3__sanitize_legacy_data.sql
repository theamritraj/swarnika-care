-- V3: Sanitize legacy seed doctor data and establish baseline active assignments

-- 1. Sanitize empty status and user_id for legacy doctors (1-6)
UPDATE `doctors` SET `status` = 'ACTIVE' WHERE `status` = '' OR `status` IS NULL;
UPDATE `doctors` SET `user_id` = CONCAT('doc-', `id`) WHERE `user_id` = '' OR `user_id` IS NULL;

-- 2. Correct legacy availability slots that pointed to invalid hospital 0 / department 0
UPDATE `doctor_availability` SET `hospital_id` = 101, `department_id` = 101 WHERE `hospital_id` = 0 AND `department_id` = 0;

-- 3. Establish baseline hospital assignments for seeded doctors
INSERT IGNORE INTO `doctor_hospital_assignments` (`id`, `doctor_id`, `hospital_id`, `department_id`, `designation`, `status`, `created_at`, `updated_at`)
VALUES
(1, 1, 101, 101, 'Senior Consultant', 'ACTIVE', NOW(), NOW()),
(2, 6, 101, 101, 'Consultant Physician', 'ACTIVE', NOW(), NOW()),
(3, 7, 101, 101, 'Visiting Cardiologist', 'ACTIVE', NOW(), NOW());
