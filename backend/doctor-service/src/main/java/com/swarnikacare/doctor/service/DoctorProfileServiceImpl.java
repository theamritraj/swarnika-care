package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.dto.DoctorProfileRequest;
import com.swarnikacare.doctor.dto.DoctorProfileResponse;
import com.swarnikacare.doctor.entity.Doctor;
import com.swarnikacare.doctor.entity.DoctorProfile;
import com.swarnikacare.doctor.entity.PublicProfileStatus;
import com.swarnikacare.doctor.exception.DoctorNotFoundException;
import com.swarnikacare.doctor.repository.DoctorProfileRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorProfileServiceImpl implements DoctorProfileService {

    private final DoctorProfileRepository profileRepository;
    private final DoctorRepository doctorRepository;
    private final com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository assignmentRepository;

    public DoctorProfileServiceImpl(DoctorProfileRepository profileRepository, 
                                    DoctorRepository doctorRepository,
                                    com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository assignmentRepository) {
        this.profileRepository = profileRepository;
        this.doctorRepository = doctorRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfileByDoctorId(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
                
        DoctorProfile profile = profileRepository.findByDoctorId(doctorId).orElse(new DoctorProfile());
        return mapToResponse(profile, doctor);
    }

    @Override
    @Transactional
    public DoctorProfileResponse upsertProfile(Long doctorId, DoctorProfileRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        DoctorProfile profile = profileRepository.findByDoctorId(doctorId).orElse(new DoctorProfile());
        
        if (profile.getId() == null) {
            profile.setDoctorId(doctorId);
            profile.setStatus(PublicProfileStatus.DRAFT);
        }
        
        profile.setBio(request.getBio());
        profile.setQualifications(request.getQualifications());
        profile.setSpecializations(request.getSpecializations());
        profile.setRegistrationNumber(request.getRegistrationNumber());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setProfilePictureUrl(request.getProfilePictureUrl());
        profile.setDefaultConsultationFee(request.getDefaultConsultationFee());
        
        DoctorProfile saved = profileRepository.save(profile);
        return mapToResponse(saved, doctor);
    }

    @Override
    @Transactional
    public DoctorProfileResponse updateStatus(Long doctorId, PublicProfileStatus status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        DoctorProfile profile = profileRepository.findByDoctorId(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Profile does not exist for this doctor"));

        profile.setStatus(status);
        DoctorProfile saved = profileRepository.save(profile);
        return mapToResponse(saved, doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> getPublishedProfiles(Long hospitalId, String specialization) {
        return profileRepository.findByStatus(PublicProfileStatus.PUBLISHED).stream()
                .filter(profile -> {
                    Doctor doctor = doctorRepository.findById(profile.getDoctorId()).orElse(null);
                    if (doctor == null || !"ACTIVE".equals(doctor.getStatus())) return false;
                    
                    if (specialization != null && !specialization.isEmpty()) {
                        if (profile.getSpecializations() == null) return false;
                        
                        boolean match = false;
                        for (String spec : profile.getSpecializations().split(",")) {
                            String slug = spec.trim().toLowerCase().replace(" & ", "-").replace(" ", "-");
                            if (slug.equals(specialization.toLowerCase())) {
                                match = true;
                                break;
                            }
                        }
                        if (!match) return false;
                    }
                    
                    return assignmentRepository.findByDoctorId(doctor.getId()).stream()
                            .anyMatch(a -> "ACTIVE".equals(a.getStatus()) && Boolean.TRUE.equals(a.getPublicAppointmentEnabled()) && (hospitalId == null || hospitalId.equals(a.getHospitalId())));
                })
                .map(profile -> {
                    Doctor doctor = doctorRepository.findById(profile.getDoctorId()).orElse(new Doctor());
                    return mapToResponse(profile, doctor);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getAvailableSpecialities(Long hospitalId) {
        List<DoctorProfileResponse> profiles = getPublishedProfiles(hospitalId, null);
        
        java.util.Map<String, java.util.Map<String, Object>> uniqueSpecialities = new java.util.HashMap<>();
        
        for (DoctorProfileResponse profile : profiles) {
            if (profile.getSpecializations() != null && !profile.getSpecializations().isEmpty()) {
                String[] specs = profile.getSpecializations().split(",");
                for (String spec : specs) {
                    String cleanSpec = spec.trim();
                    if (!cleanSpec.isEmpty()) {
                        String slug = cleanSpec.toLowerCase().replace(" & ", "-").replace(" ", "-");
                        if (!uniqueSpecialities.containsKey(slug)) {
                            java.util.Map<String, Object> specMap = new java.util.HashMap<>();
                            specMap.put("name", cleanSpec);
                            specMap.put("slug", slug);
                            uniqueSpecialities.put(slug, specMap);
                        }
                    }
                }
            }
        }
        
        return new java.util.ArrayList<>(uniqueSpecialities.values());
    }

    private DoctorProfileResponse mapToResponse(DoctorProfile profile, Doctor doctor) {
        DoctorProfileResponse response = new DoctorProfileResponse();
        response.setId(profile.getId());
        response.setDoctorId(profile.getDoctorId() != null ? profile.getDoctorId() : doctor.getId());
        response.setBio(profile.getBio());
        response.setQualifications(profile.getQualifications());
        response.setSpecializations(profile.getSpecializations());
        response.setRegistrationNumber(profile.getRegistrationNumber());
        response.setExperienceYears(profile.getExperienceYears());
        response.setProfilePictureUrl(profile.getProfilePictureUrl());
        response.setDefaultConsultationFee(profile.getDefaultConsultationFee());
        response.setStatus(profile.getStatus() != null ? profile.getStatus() : PublicProfileStatus.DRAFT);
        response.setUpdatedAt(profile.getUpdatedAt());
        
        response.setFirstName(doctor.getFirstName());
        response.setLastName(doctor.getLastName());
        return response;
    }
}
