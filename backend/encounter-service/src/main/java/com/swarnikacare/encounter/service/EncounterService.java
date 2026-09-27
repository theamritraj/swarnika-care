package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.*;

import java.util.List;

public interface EncounterService {
    EncounterResponse createEncounter(EncounterCreateRequest request);
    EncounterResponse createOpdEncounter(OpdEncounterRequest request);
    EncounterResponse createEmergencyEncounter(EmergencyEncounterRequest request);
    EncounterResponse getEncounterById(Long id);
    List<EncounterResponse> getEncountersByPatientId(Long patientId);
    List<EncounterResponse> getEncountersByHospitalId(Long hospitalId);
    List<EncounterResponse> getEncountersByDoctorId(Long doctorId);
    List<EncounterResponse> getAllEncounters();
    EncounterResponse startEncounter(Long id);
    EncounterResponse updateConsultation(Long id, ConsultationUpdateRequest request);
    EncounterResponse completeEncounter(Long id, String notes);
    EncounterResponse cancelEncounter(Long id, String reason);

    // Prescriptions
    PrescriptionResponse createPrescription(Long encounterId, PrescriptionCreateRequest request, Long doctorId);
    List<PrescriptionResponse> getPrescriptionsByEncounterId(Long encounterId);
    List<PrescriptionResponse> getPrescriptionsByPatientId(Long patientId);

    // Clinical Orders (Lab & Imaging)
    ClinicalOrderResponse createClinicalOrder(Long encounterId, ClinicalOrderCreateRequest request, Long doctorId);
    List<ClinicalOrderResponse> getClinicalOrdersByEncounterId(Long encounterId);
    List<ClinicalOrderResponse> getClinicalOrdersByPatientId(Long patientId);
}
