package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.AdmissionRequest;
import com.swarnikacare.encounter.dto.AdmissionResponse;
import com.swarnikacare.encounter.entity.Admission;
import com.swarnikacare.encounter.entity.AdmissionStatus;
import com.swarnikacare.encounter.entity.AdmissionType;
import com.swarnikacare.encounter.exception.ResourceNotFoundException;
import com.swarnikacare.encounter.repository.AdmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdmissionServiceImpl implements AdmissionService {

    private final AdmissionRepository admissionRepository;

    public AdmissionServiceImpl(AdmissionRepository admissionRepository) {
        this.admissionRepository = admissionRepository;
    }

    @Override
    @Transactional
    public AdmissionResponse createAdmission(AdmissionRequest request, String staffUserId) {
        // Duplicate active admission protection for patient
        if (request.getPatientId() != null) {
            boolean activeAdmissionExists = admissionRepository.existsByPatientIdAndStatusIn(
                    request.getPatientId(), List.of(AdmissionStatus.REQUESTED, AdmissionStatus.ADMITTED));
            if (activeAdmissionExists) {
                throw new IllegalStateException("Patient already has an active admission request or inpatient stay");
            }
        }

        // Bed collision check if bedId is provided
        if (request.getBedId() != null) {
            boolean bedOccupied = admissionRepository.existsByBedIdAndStatus(request.getBedId(), AdmissionStatus.ADMITTED);
            if (bedOccupied) {
                throw new IllegalStateException("Selected bed is already occupied by an active admission");
            }
        }

        Admission admission = new Admission();
        String datePrefix = LocalDate.now().toString().replace("-", "");
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        admission.setAdmissionNumber("ADM-" + request.getHospitalId() + "-" + datePrefix + "-" + uniqueSuffix);
        admission.setPatientId(request.getPatientId());
        admission.setHospitalId(request.getHospitalId());
        admission.setDepartmentId(request.getDepartmentId());
        admission.setAdmittingDoctorId(request.getAdmittingDoctorId());
        admission.setAdmissionDate(request.getAdmissionDate() != null ? request.getAdmissionDate() : LocalDate.now());
        admission.setAdmissionTime(request.getAdmissionTime() != null ? request.getAdmissionTime() : LocalTime.now());
        admission.setAdmissionType(request.getAdmissionType() != null ? request.getAdmissionType() : AdmissionType.ELECTIVE);
        
        // If bed is already allocated, set status to ADMITTED, else REQUESTED
        if (request.getBedId() != null) {
            admission.setStatus(AdmissionStatus.ADMITTED);
        } else {
            admission.setStatus(AdmissionStatus.REQUESTED);
        }

        admission.setWardId(request.getWardId());
        admission.setRoomId(request.getRoomId());
        admission.setBedId(request.getBedId());
        admission.setInitiatingStaffUserId(staffUserId);
        admission.setReason(request.getReason());
        admission.setNotes(request.getNotes());

        Admission saved = admissionRepository.save(admission);
        return mapToResponse(saved);
    }

    @Override
    public List<AdmissionResponse> getAdmissions(Long hospitalId, Long patientId, AdmissionStatus status) {
        List<Admission> list;
        if (hospitalId != null && status != null) {
            list = admissionRepository.findByHospitalIdAndStatus(hospitalId, status);
        } else if (hospitalId != null && patientId != null) {
            list = admissionRepository.findByHospitalIdAndPatientId(hospitalId, patientId);
        } else if (hospitalId != null) {
            list = admissionRepository.findByHospitalId(hospitalId);
        } else if (patientId != null) {
            list = admissionRepository.findByPatientId(patientId);
        } else {
            list = admissionRepository.findAll();
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public AdmissionResponse getAdmissionById(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found with id: " + id));
        return mapToResponse(admission);
    }

    @Override
    @Transactional
    public AdmissionResponse updateAdmissionStatus(Long id, AdmissionStatus status, Long bedId, String notes) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found with id: " + id));

        if (status != null && status != admission.getStatus()) {
            AdmissionStatus current = admission.getStatus();
            if (current == AdmissionStatus.DISCHARGED || current == AdmissionStatus.CANCELLED) {
                throw new IllegalStateException("Cannot transition admission from terminal status: " + current);
            }
            if (current == AdmissionStatus.REQUESTED && status != AdmissionStatus.ADMITTED && status != AdmissionStatus.CANCELLED) {
                throw new IllegalStateException("Illegal transition from REQUESTED to " + status);
            }
            if (current == AdmissionStatus.ADMITTED && status != AdmissionStatus.DISCHARGED && status != AdmissionStatus.CANCELLED) {
                throw new IllegalStateException("Illegal transition from ADMITTED to " + status);
            }
            admission.setStatus(status);
        }
        if (bedId != null) {
            if (admission.getStatus() == AdmissionStatus.ADMITTED) {
                boolean bedOccupied = admissionRepository.existsByBedIdAndStatus(bedId, AdmissionStatus.ADMITTED);
                if (bedOccupied && !bedId.equals(admission.getBedId())) {
                    throw new IllegalStateException("Selected bed is already occupied by an active admission");
                }
            }
            admission.setBedId(bedId);
        }
        if (notes != null && !notes.trim().isEmpty()) {
            admission.setNotes((admission.getNotes() != null ? admission.getNotes() + "\n" : "") + notes);
        }

        Admission updated = admissionRepository.save(admission);
        return mapToResponse(updated);
    }

    private AdmissionResponse mapToResponse(Admission a) {
        AdmissionResponse r = new AdmissionResponse();
        r.setId(a.getId());
        r.setAdmissionNumber(a.getAdmissionNumber());
        r.setPatientId(a.getPatientId());
        r.setHospitalId(a.getHospitalId());
        r.setDepartmentId(a.getDepartmentId());
        r.setAdmittingDoctorId(a.getAdmittingDoctorId());
        r.setAdmissionDate(a.getAdmissionDate());
        r.setAdmissionTime(a.getAdmissionTime());
        r.setAdmissionType(a.getAdmissionType());
        r.setStatus(a.getStatus());
        r.setWardId(a.getWardId());
        r.setRoomId(a.getRoomId());
        r.setBedId(a.getBedId());
        r.setInitiatingStaffUserId(a.getInitiatingStaffUserId());
        r.setReason(a.getReason());
        r.setNotes(a.getNotes());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
