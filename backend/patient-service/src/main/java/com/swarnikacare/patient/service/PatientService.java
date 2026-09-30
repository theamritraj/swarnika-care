package com.swarnikacare.patient.service;

import com.swarnikacare.patient.controller.PatientController.PatientSelfUpdateRequest;
import com.swarnikacare.patient.dto.PatientCreateRequest;
import com.swarnikacare.patient.dto.PatientResponse;
import com.swarnikacare.patient.dto.PatientUpdateRequest;

import java.util.List;

public interface PatientService {
    PatientResponse createPatient(PatientCreateRequest request);
    PatientResponse registerNewborn(com.swarnikacare.patient.dto.RegisterNewbornRequest request);
    PatientResponse getPatientById(Long id);
    PatientResponse getPatientByUserId(String userId);
    PatientResponse getOrCreatePatientByUserId(String userId, String email);
    PatientResponse getPatientByEmail(String email);
    List<PatientResponse> getAllPatients();
    PatientResponse updatePatient(Long id, PatientUpdateRequest request);
    PatientResponse updateMyProfile(String userId, PatientSelfUpdateRequest request);
    void deletePatient(Long id);
}
