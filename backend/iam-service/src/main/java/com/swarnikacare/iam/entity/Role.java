package com.swarnikacare.iam.entity;

import java.util.Set;

public enum Role {
    SUPER_ADMIN(Set.of(
            Permission.USER_MANAGE, Permission.DOCTOR_MANAGE, Permission.STAFF_MANAGE,
            Permission.ROLE_MANAGE, Permission.HOSPITAL_MANAGE, Permission.AUDIT_VIEW,
            Permission.REPORT_VIEW, Permission.PATIENT_VIEW, Permission.PATIENT_CREATE,
            Permission.PATIENT_UPDATE, Permission.APPOINTMENT_VIEW, Permission.APPOINTMENT_CREATE,
            Permission.APPOINTMENT_RESCHEDULE, Permission.APPOINTMENT_CANCEL, Permission.BILL_VIEW,
            Permission.ENCOUNTER_VIEW, Permission.ENCOUNTER_CREATE, Permission.ENCOUNTER_UPDATE,
            Permission.ENCOUNTER_COMPLETE, Permission.OPD_VIEW, Permission.OPD_CREATE,
            Permission.EMERGENCY_VIEW, Permission.EMERGENCY_CREATE,
            Permission.PATIENT_RELATIONSHIP_VIEW, Permission.PATIENT_RELATIONSHIP_CREATE,
            Permission.PATIENT_RELATIONSHIP_DELETE
    )),
    HOSPITAL_ADMIN(Set.of(
            Permission.PATIENT_VIEW, Permission.PATIENT_CREATE, Permission.PATIENT_UPDATE,
            Permission.APPOINTMENT_VIEW, Permission.APPOINTMENT_CREATE, Permission.APPOINTMENT_RESCHEDULE,
            Permission.APPOINTMENT_CANCEL, Permission.BILL_VIEW,
            Permission.ENCOUNTER_VIEW, Permission.ENCOUNTER_CREATE, Permission.ENCOUNTER_UPDATE,
            Permission.ENCOUNTER_COMPLETE, Permission.OPD_VIEW, Permission.OPD_CREATE,
            Permission.EMERGENCY_VIEW, Permission.EMERGENCY_CREATE,
            Permission.PATIENT_RELATIONSHIP_VIEW, Permission.PATIENT_RELATIONSHIP_CREATE,
            Permission.PATIENT_RELATIONSHIP_DELETE, Permission.STAFF_MANAGE, Permission.DOCTOR_MANAGE,
            Permission.REPORT_VIEW
    )),
    DOCTOR(Set.of(
            Permission.PATIENT_VIEW, Permission.APPOINTMENT_VIEW, Permission.APPOINTMENT_RESCHEDULE,
            Permission.APPOINTMENT_CANCEL, Permission.EHR_VIEW, Permission.EHR_WRITE,
            Permission.PRESCRIPTION_VIEW, Permission.PRESCRIPTION_CREATE, Permission.LAB_ORDER_CREATE,
            Permission.LAB_REPORT_VIEW, Permission.ENCOUNTER_VIEW, Permission.ENCOUNTER_CREATE,
            Permission.ENCOUNTER_UPDATE, Permission.ENCOUNTER_COMPLETE, Permission.OPD_VIEW,
            Permission.OPD_CREATE, Permission.EMERGENCY_VIEW, Permission.EMERGENCY_CREATE,
            Permission.PATIENT_RELATIONSHIP_VIEW
    )),
    PATIENT(Set.of(
            Permission.PATIENT_VIEW, Permission.PATIENT_UPDATE, Permission.APPOINTMENT_VIEW,
            Permission.APPOINTMENT_CREATE, Permission.APPOINTMENT_CANCEL, Permission.EHR_VIEW,
            Permission.PRESCRIPTION_VIEW, Permission.LAB_REPORT_VIEW, Permission.BILL_VIEW,
            Permission.ENCOUNTER_VIEW, Permission.OPD_VIEW, Permission.PATIENT_RELATIONSHIP_VIEW
    )),
    RECEPTIONIST(Set.of(
            Permission.PATIENT_VIEW, Permission.PATIENT_CREATE, Permission.PATIENT_UPDATE,
            Permission.APPOINTMENT_VIEW, Permission.APPOINTMENT_CREATE, Permission.APPOINTMENT_RESCHEDULE,
            Permission.APPOINTMENT_CANCEL, Permission.BILL_VIEW,
            Permission.ENCOUNTER_VIEW, Permission.ENCOUNTER_CREATE, Permission.ENCOUNTER_UPDATE,
            Permission.OPD_VIEW, Permission.OPD_CREATE, Permission.EMERGENCY_VIEW,
            Permission.EMERGENCY_CREATE, Permission.PATIENT_RELATIONSHIP_VIEW,
            Permission.PATIENT_RELATIONSHIP_CREATE, Permission.PATIENT_RELATIONSHIP_DELETE
    )),
    NURSE(Set.of(
            Permission.PATIENT_VIEW, Permission.EHR_VIEW, Permission.EHR_WRITE,
            Permission.PRESCRIPTION_VIEW, Permission.LAB_REPORT_VIEW,
            Permission.ENCOUNTER_VIEW, Permission.ENCOUNTER_UPDATE, Permission.EMERGENCY_VIEW,
            Permission.EMERGENCY_CREATE, Permission.PATIENT_RELATIONSHIP_VIEW
    )),
    LAB_TECHNICIAN(Set.of(
            Permission.PATIENT_VIEW, Permission.LAB_REPORT_VIEW, Permission.LAB_ORDER_CREATE
    )),
    PHARMACIST(Set.of(
            Permission.PATIENT_VIEW, Permission.PRESCRIPTION_VIEW
    )),
    BILLING_STAFF(Set.of(
            Permission.PATIENT_VIEW, Permission.BILL_VIEW
    ));

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }
}
