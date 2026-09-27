-- Seed standard workforce designations for hospital operations
INSERT INTO `designations` (`code`, `name`, `description`, `functional_area`, `active`, `created_at`, `updated_at`)
VALUES
('NURSE', 'Staff Nurse', 'Registered nursing and in-patient clinical care', 'NURSING', 1, NOW(), NOW()),
('CHARGE_NURSE', 'Charge Nurse', 'ICU, ward, and departmental shift nursing supervisor', 'NURSING', 1, NOW(), NOW()),
('RECEPTIONIST', 'Front Desk Receptionist', 'OPD patient registration, check-in, and reception', 'ADMINISTRATIVE', 1, NOW(), NOW()),
('LAB_TECH', 'Lab Technician', 'Pathology, sample collection, and diagnostic testing', 'DIAGNOSTICS', 1, NOW(), NOW()),
('PHARMACIST', 'Pharmacist', 'Medication inventory, verification, and dispensing', 'PHARMACY', 1, NOW(), NOW()),
('BILLING_EXEC', 'Billing Executive', 'OPD/IPD invoices, insurance clearance, and cashier', 'FINANCE', 1, NOW(), NOW()),
('OPERATIONS_MGR', 'Operations Manager', 'Facility operations and workforce administration', 'OPERATIONS', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `active` = 1, `updated_at` = NOW();
