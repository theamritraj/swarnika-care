-- V4__add_doctor_engagement_flags.sql
-- Add engagement configuration flags to doctor_hospital_assignments

ALTER TABLE doctor_hospital_assignments 
ADD COLUMN public_appointment_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE doctor_hospital_assignments 
ADD COLUMN in_house_clinical_enabled BOOLEAN NOT NULL DEFAULT true;

-- Existing assignments are treated as in-house by default, not public.
