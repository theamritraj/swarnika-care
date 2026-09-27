package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.dto.DoctorAvailabilityRequest;
import com.swarnikacare.doctor.dto.DoctorAvailabilityResponse;

import java.util.List;

public interface DoctorAvailabilityService {
    DoctorAvailabilityResponse addAvailability(Long doctorId, DoctorAvailabilityRequest request);
    List<DoctorAvailabilityResponse> getAvailabilityByDoctor(Long doctorId);
    List<DoctorAvailabilityResponse> getAvailability(Long hospitalId, Long departmentId, Long doctorId);
    void deleteAvailability(Long id);
}
