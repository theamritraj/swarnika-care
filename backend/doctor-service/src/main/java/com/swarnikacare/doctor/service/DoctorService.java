package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.dto.DoctorCreateRequest;
import com.swarnikacare.doctor.dto.DoctorDirectoryResponse;
import com.swarnikacare.doctor.dto.DoctorResponse;
import com.swarnikacare.doctor.dto.DoctorUpdateRequest;

import java.util.List;

public interface DoctorService {
    DoctorResponse createDoctor(DoctorCreateRequest request);
    DoctorResponse getDoctorById(Long id);
    DoctorResponse getDoctorByUserId(String userId);
    List<DoctorResponse> getAllDoctors();
    List<DoctorDirectoryResponse> getDoctorDirectory(Long hospitalId, Long departmentId, String search);
    DoctorResponse updateDoctor(Long id, DoctorUpdateRequest request);
    void deleteDoctor(Long id);
}
