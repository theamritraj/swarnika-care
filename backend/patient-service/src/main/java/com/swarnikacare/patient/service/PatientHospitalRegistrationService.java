package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientHospitalRegistrationRequest;
import com.swarnikacare.patient.dto.PatientHospitalRegistrationResponse;

import java.util.List;

public interface PatientHospitalRegistrationService {
    PatientHospitalRegistrationResponse registerPatientAtHospital(Long patientId, PatientHospitalRegistrationRequest request);
    List<PatientHospitalRegistrationResponse> getHospitalRegistrationsForPatient(Long patientId);
    List<PatientHospitalRegistrationResponse> getRegistrationsForHospital(Long hospitalId);
}
