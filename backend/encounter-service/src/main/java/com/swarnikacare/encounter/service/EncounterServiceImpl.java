package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.client.AppointmentClient;
import com.swarnikacare.encounter.client.DoctorClient;
import com.swarnikacare.encounter.client.OrganizationClient;
import com.swarnikacare.encounter.client.PatientClient;
import com.swarnikacare.encounter.dto.*;
import com.swarnikacare.encounter.entity.*;
import com.swarnikacare.encounter.exception.EncounterNotFoundException;
import com.swarnikacare.encounter.exception.InvalidStateTransitionException;
import com.swarnikacare.encounter.repository.ClinicalOrderRepository;
import com.swarnikacare.encounter.repository.EncounterRepository;
import com.swarnikacare.encounter.repository.PrescriptionRepository;
import com.swarnikacare.encounter.security.CustomAuthenticationDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import org.springframework.data.redis.core.RedisTemplate;
import java.time.Duration;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EncounterServiceImpl implements EncounterService {

    private static final Logger log = LoggerFactory.getLogger(EncounterServiceImpl.class);

    private final EncounterRepository encounterRepository;
    private PrescriptionRepository prescriptionRepository;
    private ClinicalOrderRepository clinicalOrderRepository;
    private PatientClient patientClient;
    private OrganizationClient organizationClient;
    private DoctorClient doctorClient;
    private AppointmentClient appointmentClient;
    private RedisTemplate<String, Object> redisTemplate;
    
    private String getEncounterCacheKey(Long id) {
        return "swarnika:prod:encounter:active:" + id;
    }
    
    private void evictEncounterCache(Long id) {
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(getEncounterCacheKey(id));
            }
        } catch (Exception e) {}
    }

    public EncounterServiceImpl(
            EncounterRepository encounterRepository,
            @Autowired(required = false) PrescriptionRepository prescriptionRepository,
            @Autowired(required = false) ClinicalOrderRepository clinicalOrderRepository) {
        this.encounterRepository = encounterRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.clinicalOrderRepository = clinicalOrderRepository;
    }

    @Autowired(required = false)
    public void setPatientClient(PatientClient patientClient) {
        this.patientClient = patientClient;
    }

    @Autowired(required = false)
    public void setRedisTemplate(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Autowired(required = false)
    public void setOrganizationClient(OrganizationClient organizationClient) {
        this.organizationClient = organizationClient;
    }

    @Autowired(required = false)
    public void setDoctorClient(DoctorClient doctorClient) {
        this.doctorClient = doctorClient;
    }

    @Autowired(required = false)
    public void setAppointmentClient(AppointmentClient appointmentClient) {
        this.appointmentClient = appointmentClient;
    }

    @Override
    @Transactional
    public EncounterResponse createEncounter(EncounterCreateRequest request) {
        log.info("Creating encounter for patient {}, hospital {}, type {}",
                request.getPatientId(), request.getHospitalId(), request.getEncounterType());

        authorizeHospitalAccess(request.getHospitalId());
        validateExternalEntities(request.getPatientId(), request.getHospitalId(),
                request.getDepartmentId(), request.getDoctorId(), request.getAppointmentId());

        Encounter encounter = new Encounter();
        encounter.setEncounterNumber(generateEncounterNumber());
        encounter.setPatientId(request.getPatientId());
        encounter.setHospitalId(request.getHospitalId());
        encounter.setDepartmentId(request.getDepartmentId());
        encounter.setDoctorId(request.getDoctorId());
        encounter.setEncounterType(request.getEncounterType());
        encounter.setStatus(EncounterStatus.OPEN);
        encounter.setAppointmentId(request.getAppointmentId());
        encounter.setSource(request.getSource() != null ? request.getSource() : EncounterSource.WALK_IN);
        encounter.setChiefComplaint(request.getChiefComplaint());
        encounter.setNotes(request.getNotes());

        Encounter saved = encounterRepository.save(encounter);
        log.info("Successfully created encounter id: {}, number: {}", saved.getId(), saved.getEncounterNumber());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EncounterResponse createOpdEncounter(OpdEncounterRequest request) {
        log.info("Creating OPD encounter for patient {}, doctor {}, hospital {}",
                request.getPatientId(), request.getDoctorId(), request.getHospitalId());

        EncounterCreateRequest generic = new EncounterCreateRequest();
        generic.setPatientId(request.getPatientId());
        generic.setHospitalId(request.getHospitalId());
        generic.setDepartmentId(request.getDepartmentId());
        generic.setDoctorId(request.getDoctorId());
        generic.setEncounterType(EncounterType.OPD);
        generic.setAppointmentId(request.getAppointmentId());
        generic.setSource(request.getAppointmentId() != null ? EncounterSource.SCHEDULED : EncounterSource.WALK_IN);
        generic.setChiefComplaint(request.getChiefComplaint());
        generic.setNotes(request.getNotes());

        return createEncounter(generic);
    }

    @Override
    @Transactional
    public EncounterResponse createEmergencyEncounter(EmergencyEncounterRequest request) {
        log.info("Creating Emergency encounter for patient {}, hospital {}",
                request.getPatientId(), request.getHospitalId());

        EncounterCreateRequest generic = new EncounterCreateRequest();
        generic.setPatientId(request.getPatientId());
        generic.setHospitalId(request.getHospitalId());
        generic.setDepartmentId(request.getDepartmentId());
        generic.setDoctorId(request.getDoctorId()); // Can be null in emergency triage
        generic.setEncounterType(EncounterType.EMERGENCY);
        generic.setAppointmentId(null); // Emergency encounters never require appointments
        generic.setSource(EncounterSource.EMERGENCY);
        generic.setChiefComplaint(request.getChiefComplaint());
        generic.setNotes(request.getNotes());

        return createEncounter(generic);
    }

    @Override
    @Transactional(readOnly = true)
    public EncounterResponse getEncounterById(Long id) {
        String cacheKey = getEncounterCacheKey(id);
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
                EncounterResponse res = mapper.convertValue(cached, EncounterResponse.class);
                authorizeHospitalAccess(res.getHospitalId());
                return res;
            }
        } catch (Exception e) {}

        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EncounterNotFoundException("Encounter not found with id: " + id));
        authorizeHospitalAccess(encounter.getHospitalId());
        
        EncounterResponse res = mapToResponse(encounter);
        if (encounter.getStatus() == EncounterStatus.IN_PROGRESS || encounter.getStatus() == EncounterStatus.OPEN) {
            try {
                redisTemplate.opsForValue().set(cacheKey, res, Duration.ofHours(4));
            } catch (Exception e) {}
        }
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EncounterResponse> getEncountersByPatientId(Long patientId) {
        return encounterRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EncounterResponse> getEncountersByHospitalId(Long hospitalId) {
        authorizeHospitalAccess(hospitalId);
        return encounterRepository.findByHospitalId(hospitalId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EncounterResponse> getAllEncounters() {
        return encounterRepository.findAll().stream()
                .filter(e -> {
                    try {
                        authorizeHospitalAccess(e.getHospitalId());
                        return true;
                    } catch (org.springframework.security.access.AccessDeniedException ex) {
                        return false;
                    }
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EncounterResponse startEncounter(Long id) {
        log.info("Starting encounter id: {}", id);
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EncounterNotFoundException("Encounter not found with id: " + id));

        authorizeHospitalAccess(encounter.getHospitalId());

        if (encounter.getStatus() != EncounterStatus.OPEN) {
            throw new InvalidStateTransitionException(
                    "Cannot start encounter with status: " + encounter.getStatus() + ". Only OPEN encounters can be started.");
        }

        encounter.setStatus(EncounterStatus.IN_PROGRESS);
        encounter.setStartedAt(LocalDateTime.now());
        Encounter saved = encounterRepository.save(encounter);
        log.info("Encounter {} started successfully", id);
        evictEncounterCache(id);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EncounterResponse completeEncounter(Long id, String notes) {
        log.info("Completing encounter id: {}", id);
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EncounterNotFoundException("Encounter not found with id: " + id));

        authorizeHospitalAccess(encounter.getHospitalId());

        if (encounter.getStatus() != EncounterStatus.IN_PROGRESS) {
            throw new InvalidStateTransitionException(
                    "Cannot complete encounter with status: " + encounter.getStatus() + ". Only IN_PROGRESS encounters can be completed.");
        }

        encounter.setStatus(EncounterStatus.COMPLETED);
        encounter.setEndedAt(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            String currentNotes = encounter.getNotes() != null ? encounter.getNotes() + "\n" : "";
            encounter.setNotes(currentNotes + "Completion Notes: " + notes);
        }

        Encounter saved = encounterRepository.save(encounter);
        log.info("Encounter {} completed successfully", id);
        evictEncounterCache(id);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EncounterResponse cancelEncounter(Long id, String reason) {
        log.info("Cancelling encounter id: {}", id);
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EncounterNotFoundException("Encounter not found with id: " + id));

        authorizeHospitalAccess(encounter.getHospitalId());

        if (encounter.getStatus() == EncounterStatus.COMPLETED || encounter.getStatus() == EncounterStatus.CANCELLED) {
            throw new InvalidStateTransitionException(
                    "Cannot cancel encounter in terminal status: " + encounter.getStatus());
        }

        encounter.setStatus(EncounterStatus.CANCELLED);
        encounter.setEndedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            String currentNotes = encounter.getNotes() != null ? encounter.getNotes() + "\n" : "";
            encounter.setNotes(currentNotes + "Cancellation Reason: " + reason);
        }

        Encounter saved = encounterRepository.save(encounter);
        log.info("Encounter {} cancelled successfully", id);
        evictEncounterCache(id);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EncounterResponse> getEncountersByDoctorId(Long doctorId) {
        log.info("Fetching encounters for doctor {}", doctorId);
        return encounterRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EncounterResponse updateConsultation(Long id, ConsultationUpdateRequest request) {
        log.info("Updating consultation for encounter {}", id);
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EncounterNotFoundException("Encounter not found with id: " + id));

        authorizeHospitalAccess(encounter.getHospitalId());

        if (encounter.getStatus() == EncounterStatus.COMPLETED || encounter.getStatus() == EncounterStatus.CANCELLED) {
            throw new InvalidStateTransitionException(
                    "Cannot update consultation for encounter with terminal status: " + encounter.getStatus());
        }

        if (request.getChiefComplaint() != null) encounter.setChiefComplaint(request.getChiefComplaint());
        if (request.getPrimaryDiagnosis() != null) encounter.setPrimaryDiagnosis(request.getPrimaryDiagnosis());
        if (request.getSecondaryDiagnosis() != null) encounter.setSecondaryDiagnosis(request.getSecondaryDiagnosis());
        if (request.getClinicalNotes() != null) encounter.setClinicalNotes(request.getClinicalNotes());
        if (request.getTreatmentPlan() != null) encounter.setTreatmentPlan(request.getTreatmentPlan());
        if (request.getFollowUpDate() != null) encounter.setFollowUpDate(request.getFollowUpDate());
        if (request.getFollowUpNotes() != null) encounter.setFollowUpNotes(request.getFollowUpNotes());

        Encounter saved = encounterRepository.save(encounter);
        log.info("Consultation updated successfully for encounter {}", id);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PrescriptionResponse createPrescription(Long encounterId, PrescriptionCreateRequest request, Long doctorId) {
        log.info("Creating prescription for encounter {}", encounterId);
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new EncounterNotFoundException("Encounter not found with id: " + encounterId));

        authorizeHospitalAccess(encounter.getHospitalId());

        if (encounter.getStatus() == EncounterStatus.CANCELLED) {
            throw new InvalidStateTransitionException("Cannot create prescription for cancelled encounter");
        }

        Prescription prescription = new Prescription();
        prescription.setPrescriptionNumber(generatePrescriptionNumber());
        prescription.setEncounterId(encounterId);
        prescription.setDoctorId(doctorId != null ? doctorId : (encounter.getDoctorId() != null ? encounter.getDoctorId() : 0L));
        prescription.setPatientId(encounter.getPatientId());
        prescription.setHospitalId(encounter.getHospitalId());
        prescription.setNotes(request.getNotes());

        if (request.getItems() != null) {
            for (PrescriptionItemDto itemDto : request.getItems()) {
                PrescriptionItem item = new PrescriptionItem();
                item.setMedicineName(itemDto.getMedicineName());
                item.setDosage(itemDto.getDosage());
                item.setFrequency(itemDto.getFrequency());
                item.setDuration(itemDto.getDuration());
                item.setRoute(itemDto.getRoute());
                item.setInstructions(itemDto.getInstructions());
                prescription.addItem(item);
            }
        }

        Prescription saved = prescriptionRepository.save(prescription);
        log.info("Prescription created successfully with number: {}", saved.getPrescriptionNumber());
        return mapToPrescriptionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByEncounterId(Long encounterId) {
        if (prescriptionRepository == null) return List.of();
        return prescriptionRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToPrescriptionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByPatientId(Long patientId) {
        if (prescriptionRepository == null) return List.of();
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::mapToPrescriptionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClinicalOrderResponse createClinicalOrder(Long encounterId, ClinicalOrderCreateRequest request, Long doctorId) {
        log.info("Creating clinical order ({}) for encounter {}", request.getOrderType(), encounterId);
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new EncounterNotFoundException("Encounter not found with id: " + encounterId));

        authorizeHospitalAccess(encounter.getHospitalId());

        if (encounter.getStatus() == EncounterStatus.CANCELLED) {
            throw new InvalidStateTransitionException("Cannot create clinical order for cancelled encounter");
        }

        ClinicalOrder order = new ClinicalOrder();
        order.setOrderNumber(generateOrderNumber(request.getOrderType()));
        order.setEncounterId(encounterId);
        order.setDoctorId(doctorId != null ? doctorId : (encounter.getDoctorId() != null ? encounter.getDoctorId() : 0L));
        order.setPatientId(encounter.getPatientId());
        order.setHospitalId(encounter.getHospitalId());
        order.setOrderType(request.getOrderType());
        order.setTestName(request.getTestName());
        order.setPriority(request.getPriority() != null ? request.getPriority() : "ROUTINE");
        order.setClinicalIndication(request.getClinicalIndication());
        order.setStatus("ORDERED");

        ClinicalOrder saved = clinicalOrderRepository.save(order);
        log.info("Clinical order created successfully with number: {}", saved.getOrderNumber());
        return mapToOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicalOrderResponse> getClinicalOrdersByEncounterId(Long encounterId) {
        if (clinicalOrderRepository == null) return List.of();
        return clinicalOrderRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicalOrderResponse> getClinicalOrdersByPatientId(Long patientId) {
        if (clinicalOrderRepository == null) return List.of();
        return clinicalOrderRepository.findByPatientId(patientId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    private String generatePrescriptionNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Random random = new Random();
        String num;
        do {
            int seq = 10000 + random.nextInt(90000);
            num = "RX-" + datePart + "-" + seq;
        } while (prescriptionRepository != null && prescriptionRepository.findByPrescriptionNumber(num).isPresent());
        return num;
    }

    private String generateOrderNumber(ClinicalOrderType orderType) {
        String prefix = orderType == ClinicalOrderType.LAB ? "LAB-" : "RAD-";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Random random = new Random();
        String num;
        do {
            int seq = 10000 + random.nextInt(90000);
            num = prefix + datePart + "-" + seq;
        } while (clinicalOrderRepository != null && clinicalOrderRepository.findByOrderNumber(num).isPresent());
        return num;
    }

    private PrescriptionResponse mapToPrescriptionResponse(Prescription p) {
        PrescriptionResponse resp = new PrescriptionResponse();
        resp.setId(p.getId());
        resp.setPrescriptionNumber(p.getPrescriptionNumber());
        resp.setEncounterId(p.getEncounterId());
        resp.setDoctorId(p.getDoctorId());
        resp.setPatientId(p.getPatientId());
        resp.setHospitalId(p.getHospitalId());
        resp.setNotes(p.getNotes());
        resp.setCreatedAt(p.getCreatedAt());
        resp.setUpdatedAt(p.getUpdatedAt());

        List<PrescriptionItemDto> itemDtos = new ArrayList<>();
        if (p.getItems() != null) {
            for (PrescriptionItem item : p.getItems()) {
                PrescriptionItemDto dto = new PrescriptionItemDto();
                dto.setId(item.getId());
                dto.setMedicineName(item.getMedicineName());
                dto.setDosage(item.getDosage());
                dto.setFrequency(item.getFrequency());
                dto.setDuration(item.getDuration());
                dto.setRoute(item.getRoute());
                dto.setInstructions(item.getInstructions());
                itemDtos.add(dto);
            }
        }
        resp.setItems(itemDtos);
        return resp;
    }

    private ClinicalOrderResponse mapToOrderResponse(ClinicalOrder o) {
        ClinicalOrderResponse resp = new ClinicalOrderResponse();
        resp.setId(o.getId());
        resp.setOrderNumber(o.getOrderNumber());
        resp.setEncounterId(o.getEncounterId());
        resp.setDoctorId(o.getDoctorId());
        resp.setPatientId(o.getPatientId());
        resp.setHospitalId(o.getHospitalId());
        resp.setOrderType(o.getOrderType());
        resp.setTestName(o.getTestName());
        resp.setPriority(o.getPriority());
        resp.setClinicalIndication(o.getClinicalIndication());
        resp.setStatus(o.getStatus());
        resp.setCreatedAt(o.getCreatedAt());
        resp.setUpdatedAt(o.getUpdatedAt());
        return resp;
    }

    private void authorizeHospitalAccess(Long hospitalId) {
        if (hospitalId == null) return;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return;

        boolean isSuperAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_SUPER_ADMIN"));
        if (isSuperAdmin) return;

        Long tokenHospitalId = null;
        if (auth.getDetails() instanceof CustomAuthenticationDetails customDetails) {
            tokenHospitalId = customDetails.getHospitalId();
        }

        boolean isHospitalScoped = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_HOSPITAL_ADMIN") || a.equals("ROLE_RECEPTIONIST"));

        if (isHospitalScoped && tokenHospitalId != null && !tokenHospitalId.equals(hospitalId)) {
            throw new AccessDeniedException(
                    "Access denied: You are not authorized for hospital ID: " + hospitalId);
        }
    }

    private void validateExternalEntities(Long patientId, Long hospitalId, Long departmentId, Long doctorId, Long appointmentId) {
        if (patientClient != null) {
            try {
                patientClient.getPatientById(patientId);
            } catch (Exception e) {
                log.warn("Patient validation skipped or failed for id {}: {}", patientId, e.getMessage());
            }
        }
        if (organizationClient != null) {
            try {
                organizationClient.getHospitalById(hospitalId);
                organizationClient.getDepartmentById(departmentId);
            } catch (Exception e) {
                log.warn("Hospital/department validation skipped or failed: {}", e.getMessage());
            }
        }
        if (doctorId != null && doctorClient != null) {
            try {
                doctorClient.getDoctorById(doctorId);
            } catch (Exception e) {
                log.warn("Doctor validation skipped or failed for id {}: {}", doctorId, e.getMessage());
            }
        }
        if (appointmentId != null && appointmentClient != null) {
            try {
                appointmentClient.getAppointmentById(appointmentId);
            } catch (Exception e) {
                log.warn("Appointment validation skipped or failed for id {}: {}", appointmentId, e.getMessage());
            }
        }
    }

    private String generateEncounterNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String encNum;
        Random random = new Random();
        do {
            int seq = 10000 + random.nextInt(90000);
            encNum = "ENC-" + datePart + "-" + seq;
        } while (encounterRepository.existsByEncounterNumber(encNum));
        return encNum;
    }

    private EncounterResponse mapToResponse(Encounter encounter) {
        EncounterResponse response = new EncounterResponse();
        response.setId(encounter.getId());
        response.setEncounterNumber(encounter.getEncounterNumber());
        response.setPatientId(encounter.getPatientId());
        response.setHospitalId(encounter.getHospitalId());
        response.setDepartmentId(encounter.getDepartmentId());
        response.setDoctorId(encounter.getDoctorId());
        response.setEncounterType(encounter.getEncounterType());
        response.setStatus(encounter.getStatus());
        response.setAppointmentId(encounter.getAppointmentId());
        response.setSource(encounter.getSource());
        response.setChiefComplaint(encounter.getChiefComplaint());
        response.setNotes(encounter.getNotes());
        response.setPrimaryDiagnosis(encounter.getPrimaryDiagnosis());
        response.setSecondaryDiagnosis(encounter.getSecondaryDiagnosis());
        response.setClinicalNotes(encounter.getClinicalNotes());
        response.setTreatmentPlan(encounter.getTreatmentPlan());
        response.setFollowUpDate(encounter.getFollowUpDate());
        response.setFollowUpNotes(encounter.getFollowUpNotes());
        response.setStartedAt(encounter.getStartedAt());
        response.setEndedAt(encounter.getEndedAt());
        response.setCreatedAt(encounter.getCreatedAt());
        response.setUpdatedAt(encounter.getUpdatedAt());
        return response;
    }
}
