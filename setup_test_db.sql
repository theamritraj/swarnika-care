USE organization_db;
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM employees;
DELETE FROM positions;
DELETE FROM designations;
DELETE FROM departments;
DELETE FROM hospitals;
SET FOREIGN_KEY_CHECKS=1;

INSERT INTO hospitals (id, code, name, email, phone, status) VALUES 
(101, 'HOS-A', 'Hospital A', 'a@hospital.com', '1234567890', 'ACTIVE'),
(102, 'HOS-B', 'Hospital B', 'b@hospital.com', '0987654321', 'ACTIVE');

INSERT INTO departments (id, code, hospital_id, name, status) VALUES 
(101, 'DEP-A', 101, 'Dept A', 'ACTIVE'),
(102, 'DEP-B', 102, 'Dept B', 'ACTIVE');

INSERT INTO designations (id, code, name, active) VALUES 
(1, 'HADMIN', 'Hospital Admin', 1),
(2, 'STAFF', 'Staff', 1);
