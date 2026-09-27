package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.dto.DoctorProfileRequest;
import com.swarnikacare.doctor.dto.DoctorProfileResponse;
import com.swarnikacare.doctor.entity.PublicProfileStatus;
import java.util.List;

public interface DoctorProfileService {
    DoctorProfileResponse getProfileByDoctorId(Long doctorId);
    DoctorProfileResponse upsertProfile(Long doctorId, DoctorProfileRequest request);
    DoctorProfileResponse updateStatus(Long doctorId, PublicProfileStatus status);
    List<DoctorProfileResponse> getPublishedProfiles(Long hospitalId, String specialization);
    List<java.util.Map<String, Object>> getAvailableSpecialities(Long hospitalId);
}
