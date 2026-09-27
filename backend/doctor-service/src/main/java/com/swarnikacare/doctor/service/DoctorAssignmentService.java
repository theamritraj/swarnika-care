package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.dto.DoctorAssignmentRequest;
import com.swarnikacare.doctor.dto.DoctorAssignmentResponse;

import java.util.List;

public interface DoctorAssignmentService {
    DoctorAssignmentResponse createAssignment(Long doctorId, DoctorAssignmentRequest request);
    List<DoctorAssignmentResponse> getAssignmentsByDoctor(Long doctorId);
    List<DoctorAssignmentResponse> getAssignmentsByHospital(Long hospitalId, Long departmentId);
    void deleteAssignment(Long assignmentId);
}
