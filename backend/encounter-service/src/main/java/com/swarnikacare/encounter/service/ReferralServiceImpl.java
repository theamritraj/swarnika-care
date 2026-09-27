package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.ReferralRequest;
import com.swarnikacare.encounter.dto.ReferralResponse;
import com.swarnikacare.encounter.entity.Referral;
import com.swarnikacare.encounter.entity.ReferralPriority;
import com.swarnikacare.encounter.entity.ReferralStatus;
import com.swarnikacare.encounter.entity.ReferralType;
import com.swarnikacare.encounter.exception.ResourceNotFoundException;
import com.swarnikacare.encounter.repository.ReferralRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReferralServiceImpl implements ReferralService {

    private final ReferralRepository referralRepository;

    public ReferralServiceImpl(ReferralRepository referralRepository) {
        this.referralRepository = referralRepository;
    }

    @Override
    @Transactional
    public ReferralResponse createReferral(ReferralRequest request) {
        Referral referral = new Referral();
        String datePrefix = LocalDate.now().toString().replace("-", "");
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        referral.setReferralNumber("REF-" + request.getTargetHospitalId() + "-" + datePrefix + "-" + uniqueSuffix);
        referral.setPatientId(request.getPatientId());
        referral.setHospitalId(request.getHospitalId());
        referral.setReferringDoctorId(request.getReferringDoctorId());
        referral.setFromDepartmentId(request.getFromDepartmentId());
        referral.setTargetHospitalId(request.getTargetHospitalId());
        referral.setTargetDepartmentId(request.getTargetDepartmentId());
        referral.setTargetDoctorId(request.getTargetDoctorId());
        referral.setReferralType(request.getReferralType() != null ? request.getReferralType() : ReferralType.INTERNAL);
        referral.setPriority(request.getPriority() != null ? request.getPriority() : ReferralPriority.ROUTINE);
        referral.setStatus(ReferralStatus.REQUESTED);
        referral.setReason(request.getReason());
        referral.setClinicalNotes(request.getClinicalNotes());
        referral.setAdministrativeNotes(request.getAdministrativeNotes());

        Referral saved = referralRepository.save(referral);
        return mapToResponse(saved);
    }

    @Override
    public List<ReferralResponse> getReferrals(Long hospitalId, Long patientId, ReferralStatus status) {
        List<Referral> list;
        if (hospitalId != null && status != null) {
            list = referralRepository.findByTargetHospitalIdAndStatus(hospitalId, status);
        } else if (hospitalId != null) {
            list = referralRepository.findByHospitalIdOrTargetHospitalId(hospitalId, hospitalId);
        } else if (patientId != null) {
            list = referralRepository.findByPatientId(patientId);
        } else {
            list = referralRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ReferralResponse getReferralById(Long id) {
        Referral referral = referralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Referral not found with id: " + id));
        return mapToResponse(referral);
    }

    @Override
    @Transactional
    public ReferralResponse updateReferralStatus(Long id, ReferralStatus status, Long appointmentId, String administrativeNotes) {
        Referral referral = referralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Referral not found with id: " + id));

        if (status != null && status != referral.getStatus()) {
            ReferralStatus current = referral.getStatus();
            if (current == ReferralStatus.COMPLETED || current == ReferralStatus.CANCELLED || current == ReferralStatus.REJECTED) {
                throw new IllegalStateException("Cannot transition referral from terminal status: " + current);
            }
            if (current == ReferralStatus.REQUESTED) {
                if (status != ReferralStatus.ACKNOWLEDGED && status != ReferralStatus.SCHEDULED && status != ReferralStatus.CANCELLED && status != ReferralStatus.REJECTED) {
                    throw new IllegalStateException("Illegal transition from REQUESTED to " + status);
                }
            } else if (current == ReferralStatus.ACKNOWLEDGED) {
                if (status != ReferralStatus.SCHEDULED && status != ReferralStatus.CANCELLED && status != ReferralStatus.REJECTED) {
                    throw new IllegalStateException("Illegal transition from ACKNOWLEDGED to " + status);
                }
            } else if (current == ReferralStatus.SCHEDULED) {
                if (status != ReferralStatus.COMPLETED && status != ReferralStatus.CANCELLED && status != ReferralStatus.REJECTED) {
                    throw new IllegalStateException("Illegal transition from SCHEDULED to " + status);
                }
            }
            referral.setStatus(status);
        }
        if (appointmentId != null) {
            referral.setAppointmentId(appointmentId);
            if (referral.getStatus() == ReferralStatus.REQUESTED || referral.getStatus() == ReferralStatus.ACKNOWLEDGED) {
                referral.setStatus(ReferralStatus.SCHEDULED);
            }
        }
        if (administrativeNotes != null && !administrativeNotes.trim().isEmpty()) {
            referral.setAdministrativeNotes((referral.getAdministrativeNotes() != null ? referral.getAdministrativeNotes() + "\n" : "") + administrativeNotes);
        }

        Referral updated = referralRepository.save(referral);
        return mapToResponse(updated);
    }

    private ReferralResponse mapToResponse(Referral ref) {
        ReferralResponse r = new ReferralResponse();
        r.setId(ref.getId());
        r.setReferralNumber(ref.getReferralNumber());
        r.setPatientId(ref.getPatientId());
        r.setHospitalId(ref.getHospitalId());
        r.setReferringDoctorId(ref.getReferringDoctorId());
        r.setFromDepartmentId(ref.getFromDepartmentId());
        r.setTargetHospitalId(ref.getTargetHospitalId());
        r.setTargetDepartmentId(ref.getTargetDepartmentId());
        r.setTargetDoctorId(ref.getTargetDoctorId());
        r.setReferralType(ref.getReferralType());
        r.setPriority(ref.getPriority());
        r.setStatus(ref.getStatus());
        r.setReason(ref.getReason());
        r.setClinicalNotes(ref.getClinicalNotes());
        r.setAppointmentId(ref.getAppointmentId());
        r.setAdministrativeNotes(ref.getAdministrativeNotes());
        r.setCreatedAt(ref.getCreatedAt());
        r.setUpdatedAt(ref.getUpdatedAt());
        return r;
    }
}
