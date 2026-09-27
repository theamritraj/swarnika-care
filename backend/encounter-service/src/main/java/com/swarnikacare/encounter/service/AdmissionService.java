package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.AdmissionRequest;
import com.swarnikacare.encounter.dto.AdmissionResponse;
import com.swarnikacare.encounter.entity.AdmissionStatus;

import java.util.List;

public interface AdmissionService {
    AdmissionResponse createAdmission(AdmissionRequest request, String staffUserId);
    List<AdmissionResponse> getAdmissions(Long hospitalId, Long patientId, AdmissionStatus status);
    AdmissionResponse getAdmissionById(Long id);
    AdmissionResponse updateAdmissionStatus(Long id, AdmissionStatus status, Long bedId, String notes);
}
