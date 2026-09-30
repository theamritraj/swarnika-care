package com.swarnikacare.appointment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swarnikacare.appointment.client.DoctorClient;
import com.swarnikacare.appointment.client.OrganizationClient;
import com.swarnikacare.appointment.client.PatientClient;
import com.swarnikacare.appointment.dto.AppointmentCreateRequest;
import com.swarnikacare.appointment.dto.AppointmentResponse;
import com.swarnikacare.appointment.dto.AppointmentUpdateRequest;
import com.swarnikacare.appointment.dto.AppointmentCancelRequest;
import com.swarnikacare.appointment.dto.AppointmentRescheduleRequest;
import com.swarnikacare.appointment.entity.Appointment;
import com.swarnikacare.appointment.entity.AppointmentStatus;
import com.swarnikacare.appointment.entity.BookingSource;
import com.swarnikacare.appointment.entity.DoctorScheduleLock;
import com.swarnikacare.appointment.exception.AppointmentConflictException;
import com.swarnikacare.appointment.exception.AppointmentNotFoundException;
import com.swarnikacare.appointment.exception.DoctorUnavailableException;
import com.swarnikacare.appointment.exception.IntegrationException;
import com.swarnikacare.appointment.exception.InvalidAppointmentTimeException;
import com.swarnikacare.appointment.outbox.OutboxEventRepository;
import com.swarnikacare.appointment.repository.AppointmentRepository;
import com.swarnikacare.appointment.repository.DoctorScheduleLockRepository;
import com.swarnikacare.appointment.security.CustomAuthenticationDetails;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.redis.core.RedisTemplate;
import java.time.Duration;
import java.util.UUID;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import com.swarnikacare.appointment.entity.AppointmentType;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    private final AppointmentRepository appointmentRepository;
    private final DoctorScheduleLockRepository doctorScheduleLockRepository;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;
    private final OrganizationClient organizationClient;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired(required = false)
    private AppointmentEmailService appointmentEmailService;

    @Value("${kafka.topic.appointment.booked:appointment.booked}")
    private String appointmentBookedTopic;
    
    @Value("${kafka.topic.appointment.cancelled:appointment.cancelled}")
    private String appointmentCancelledTopic;
    
    @Value("${kafka.topic.appointment.completed:appointment.completed}")
    private String appointmentCompletedTopic;
    
    @Value("${kafka.topic.appointment.rescheduled:appointment.rescheduled}")
    private String appointmentRescheduledTopic;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  DoctorScheduleLockRepository doctorScheduleLockRepository,
                                  PatientClient patientClient,
                                  DoctorClient doctorClient,
                                  OrganizationClient organizationClient,
                                  OutboxEventRepository outboxEventRepository,
                                  ObjectMapper objectMapper,
                                  RedisTemplate<String, Object> redisTemplate) {
        this.appointmentRepository = appointmentRepository;
        this.doctorScheduleLockRepository = doctorScheduleLockRepository;
        this.patientClient = patientClient;
        this.doctorClient = doctorClient;
        this.organizationClient = organizationClient;
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
        this.redisTemplate = redisTemplate;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        if (request.getHospitalId() == null) {
            request.setHospitalId(101L);
        }
        if (request.getDepartmentId() == null) {
            request.setDepartmentId(101L);
        }
        if (request.getEndTime() == null && request.getStartTime() != null) {
            request.setEndTime(request.getStartTime().plusMinutes(30));
        }
        if (request.getAppointmentType() == null) {
            request.setAppointmentType(AppointmentType.CONSULTATION);
        }
        boolean isPublicGuest = (request.getPatientName() != null && !request.getPatientName().isBlank());
        if (request.getPatientId() == null) {
            Long resolvedPatientId = null;
            if (request.getPatientEmail() != null && !request.getPatientEmail().isBlank()) {
                try {
                    Map<String, Object> pResp = patientClient.getPatientByEmail(request.getPatientEmail().trim().toLowerCase());
                    if (pResp != null && pResp.get("data") instanceof Map<?, ?> pData) {
                        Object idObj = pData.get("id");
                        if (idObj instanceof Number) {
                            resolvedPatientId = ((Number) idObj).longValue();
                        }
                    }
                } catch (Exception ignored) {}
            }
            request.setPatientId(resolvedPatientId != null ? resolvedPatientId : 1L);
        }

        authorizeHospitalAction(request.getHospitalId());
        validateTimeSlot(request.getStartTime(), request.getEndTime());

        Map<String, Object> patientData = null;
        if (isPublicGuest) {
            patientData = new HashMap<>();
            patientData.put("id", request.getPatientId());
            patientData.put("firstName", request.getPatientName());
            patientData.put("lastName", "");
            patientData.put("email", request.getPatientEmail() != null ? request.getPatientEmail() : "");
            patientData.put("phone", request.getPatientMobile() != null ? request.getPatientMobile() : "");
        } else {
            patientData = validatePatientExists(request.getPatientId());
        }

        Map<String, Object> doctorData = validateDoctorExists(request.getDoctorId());
        Map<String, Object> hospitalData = isPublicGuest ? validateHospitalExistsSafe(request.getHospitalId()) : validateHospitalExists(request.getHospitalId());
        if (!isPublicGuest) {
            validateDepartmentExists(request.getDepartmentId());
        }

        // Validate doctor belongs to hospital and department
        validateDoctorHospitalAndDepartment(doctorData, request.getHospitalId(), request.getDepartmentId());

        authorizePatientAction(patientData);

        validateDoctorAvailability(request.getDoctorId(), request.getAppointmentDate(), request.getStartTime(), request.getEndTime());

        String lockToken = UUID.randomUUID().toString();
        acquireSlotLock(request.getHospitalId(), request.getDoctorId(), request.getAppointmentDate(), request.getStartTime(), lockToken);

        try {
            acquireDoctorLock(request.getDoctorId());
            checkDoubleBooking(request.getDoctorId(), request.getAppointmentDate(), request.getStartTime(), request.getEndTime(), null);

            Appointment appointment = new Appointment();
            appointment.setAppointmentNumber(generateAppointmentNumber());
            appointment.setPatientId(request.getPatientId());
            appointment.setDoctorId(request.getDoctorId());
            appointment.setHospitalId(request.getHospitalId());
            appointment.setDepartmentId(request.getDepartmentId());
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setStartTime(request.getStartTime());
            appointment.setEndTime(request.getEndTime());
            appointment.setAppointmentType(request.getAppointmentType());
            appointment.setStatus(AppointmentStatus.SCHEDULED);
            appointment.setReason(request.getReason() != null ? request.getReason() : "Online Consultation Booking");
            
            String notes = request.getNotes();
            if (request.getPatientName() != null || request.getPatientMobile() != null) {
                String contact = "Patient Contact: " + (request.getPatientName() != null ? request.getPatientName() : "") +
                        (request.getPatientMobile() != null ? " (" + request.getPatientMobile() + ")" : "") +
                        (request.getPatientEmail() != null ? " <" + request.getPatientEmail() + ">" : "");
                notes = (notes == null || notes.isBlank()) ? contact : notes + " | " + contact;
            }
            appointment.setNotes(notes);
            
            appointment.setBookingSource(determineBookingSource());

            Appointment saved = appointmentRepository.save(appointment);
            publishAppointmentEvent(saved, patientData, doctorData, hospitalData, appointmentBookedTopic, "AppointmentBookedEvent");

            // Send confirmation email asynchronously to user's email address
            if (appointmentEmailService != null) {
                String recipientEmail = null;
                if (patientData != null && patientData.get("email") != null && !String.valueOf(patientData.get("email")).isBlank()) {
                    recipientEmail = String.valueOf(patientData.get("email"));
                } else if (request.getPatientEmail() != null && !request.getPatientEmail().isBlank()) {
                    recipientEmail = request.getPatientEmail();
                }

                String patientFullName = "";
                if (patientData != null) {
                    String fn = patientData.get("firstName") != null ? String.valueOf(patientData.get("firstName")) : "";
                    String ln = patientData.get("lastName") != null ? String.valueOf(patientData.get("lastName")) : "";
                    patientFullName = (fn + " " + ln).trim();
                }
                if (patientFullName.isBlank() && request.getPatientName() != null) {
                    patientFullName = request.getPatientName().trim();
                }

                String doctorFullName = "";
                if (doctorData != null) {
                    String fn = doctorData.get("firstName") != null ? String.valueOf(doctorData.get("firstName")) : "";
                    String ln = doctorData.get("lastName") != null ? String.valueOf(doctorData.get("lastName")) : "";
                    doctorFullName = ("Dr. " + fn + " " + ln).trim();
                } else {
                    doctorFullName = resolveDoctorNameFallback(saved.getDoctorId());
                }

                String hospitalName = (hospitalData != null && hospitalData.get("name") != null) 
                        ? String.valueOf(hospitalData.get("name")) : "Swarnika Hospitals Main Branch";
                String hospitalAddress = (hospitalData != null && hospitalData.get("address") != null) 
                        ? String.valueOf(hospitalData.get("address")) : "Healthcare City, Sasaram, Bihar";

                if (recipientEmail != null && !recipientEmail.isBlank()) {
                    appointmentEmailService.sendBookingConfirmationEmail(
                            saved,
                            recipientEmail,
                            patientFullName,
                            doctorFullName,
                            hospitalName,
                            hospitalAddress
                    );
                }
            }

            return mapToResponse(saved, patientData, doctorData, hospitalData);
        } finally {
            releaseSlotLock(request.getHospitalId(), request.getDoctorId(), request.getAppointmentDate(), request.getStartTime(), lockToken);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentRead(appointment);
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public List<AppointmentResponse> getAppointmentsByPatient(Long patientId) {
        Map<String, Object> patientData = validatePatientExists(patientId);
        authorizePatientAction(patientData);

        // Check if there are unlinked guest appointments booked with this patient's email
        String email = (String) patientData.get("email");
        if (email != null && !email.isBlank()) {
            String cleanEmail = email.trim();
            List<Appointment> guestAppts = appointmentRepository.findByNotesContaining(cleanEmail);
            for (Appointment ga : guestAppts) {
                if (ga.getPatientId() == null || ga.getPatientId().equals(1L)) {
                    ga.setPatientId(patientId);
                    appointmentRepository.save(ga);
                }
            }
        }

        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDoctor(Long doctorId) {
        Map<String, Object> doctorData = validateDoctorExists(doctorId);
        authorizeDoctorAction(doctorData);
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentUpdateRequest request) {
        // Not widely used in Phase 3; usually specific endpoints are used.
        throw new UnsupportedOperationException("Arbitrary PUT updates are disabled. Use specific endpoints like /reschedule, /cancel");
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(Long id, AppointmentCancelRequest request) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentAction(appointment);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new InvalidAppointmentTimeException("Cannot cancel an appointment that is already " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(request.getReason());
        appointment.setCancelledAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        
        publishAppointmentEvent(saved, null, null, null, appointmentCancelledTopic, "AppointmentCancelledEvent");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse completeAppointment(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentAction(appointment);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new InvalidAppointmentTimeException("Only SCHEDULED or CONFIRMED appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setCompletedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        
        publishAppointmentEvent(saved, null, null, null, appointmentCompletedTopic, "AppointmentCompletedEvent");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse confirmAppointment(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentAction(appointment);

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new InvalidAppointmentTimeException("Only SCHEDULED appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment saved = appointmentRepository.save(appointment);
        
        publishAppointmentEvent(saved, null, null, null, "swarnika.appointment.confirmed", "AppointmentConfirmedEvent");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse noShowAppointment(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentAction(appointment);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new InvalidAppointmentTimeException("Only SCHEDULED or CONFIRMED appointments can be marked as no-show");
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        Appointment saved = appointmentRepository.save(appointment);
        
        publishAppointmentEvent(saved, null, null, null, "swarnika.appointment.noshow", "AppointmentNoShowEvent");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse rescheduleAppointment(Long id, AppointmentRescheduleRequest request) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentAction(appointment);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            throw new InvalidAppointmentTimeException("Cannot reschedule an appointment that is " + appointment.getStatus());
        }

        validateTimeSlot(request.getNewStartTime(), request.getNewEndTime());
        validateDoctorAvailability(appointment.getDoctorId(), request.getNewAppointmentDate(), request.getNewStartTime(), request.getNewEndTime());

        acquireDoctorLock(appointment.getDoctorId());
        checkDoubleBooking(appointment.getDoctorId(), request.getNewAppointmentDate(), request.getNewStartTime(), request.getNewEndTime(), appointment.getId());

        appointment.setAppointmentDate(request.getNewAppointmentDate());
        appointment.setStartTime(request.getNewStartTime());
        appointment.setEndTime(request.getNewEndTime());
        appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "Rescheduled reason: " + request.getReason());
        
        Appointment saved = appointmentRepository.save(appointment);
        publishAppointmentEvent(saved, null, null, null, appointmentRescheduledTopic, "AppointmentRescheduledEvent");
        return mapToResponse(saved);
    }

    private void acquireDoctorLock(Long doctorId) {
        // Try to get existing lock, or create one if it doesn't exist.
        try {
            doctorScheduleLockRepository.findByDoctorIdForUpdate(doctorId)
                .orElseGet(() -> doctorScheduleLockRepository.save(new DoctorScheduleLock(doctorId)));
        } catch (Exception e) {
            // Concurrent insert might fail, wait and retry or just rely on the read lock
            log.warn("Doctor lock acquisition contention for {}", doctorId);
        }
    }

    private void acquireSlotLock(Long hospitalId, Long doctorId, LocalDate date, LocalTime slot, String lockToken) {
        String key = "swarnika:prod:appointment:lock:hospital:" + hospitalId + ":doctor:" + doctorId + ":" + date + ":" + slot;
        Boolean acquired = false;
        try {
            if (redisTemplate != null && redisTemplate.opsForValue() != null) {
                acquired = redisTemplate.opsForValue().setIfAbsent(key, lockToken, Duration.ofSeconds(30));
            } else {
                return;
            }
        } catch (Exception e) {
            log.warn("Redis unavailable, proceeding with DB lock only", e);
            return;
        }
        if (Boolean.FALSE.equals(acquired)) {
            throw new AppointmentConflictException("This slot is currently being booked by someone else. Please try again or choose another slot.");
        }
    }

    private void releaseSlotLock(Long hospitalId, Long doctorId, LocalDate date, LocalTime slot, String lockToken) {
        String key = "swarnika:prod:appointment:lock:hospital:" + hospitalId + ":doctor:" + doctorId + ":" + date + ":" + slot;
        try {
            if (redisTemplate != null && redisTemplate.opsForValue() != null) {
                Object current = redisTemplate.opsForValue().get(key);
                if (lockToken.equals(current)) {
                    redisTemplate.delete(key);
                }
            }
        } catch (Exception e) {
            log.warn("Redis unavailable during lock release", e);
        }
    }

    private Appointment findByIdOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with id: " + id));
    }

    private void validateTimeSlot(LocalTime startTime, LocalTime endTime) {
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new InvalidAppointmentTimeException("Start time must be before end time");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> validatePatientExists(Long patientId) {
        try {
            Map<String, Object> response = patientClient.getPatientById(patientId);
            if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                throw new IntegrationException("Patient not found");
            }
            return (Map<String, Object>) response.get("data");
        } catch (FeignException.NotFound e) {
            throw new IntegrationException("Patient not found with id: " + patientId);
        } catch (Exception e) {
            log.error("Error communicating with Patient Service", e);
            throw new IntegrationException("Could not verify patient existence: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> validateDoctorExists(Long doctorId) {
        try {
            Map<String, Object> response = doctorClient.getDoctorById(doctorId);
            if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                throw new IntegrationException("Doctor not found");
            }
            return (Map<String, Object>) response.get("data");
        } catch (FeignException.NotFound e) {
            throw new IntegrationException("Doctor not found with id: " + doctorId);
        } catch (Exception e) {
            log.error("Error communicating with Doctor Service", e);
            throw new IntegrationException("Could not verify doctor existence: " + e.getMessage());
        }
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> validateHospitalExists(Long hospitalId) {
        try {
            Map<String, Object> response = organizationClient.getHospitalById(hospitalId);
            if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                throw new IntegrationException("Hospital not found");
            }
            return (Map<String, Object>) response.get("data");
        } catch (FeignException.NotFound e) {
            throw new IntegrationException("Hospital not found with id: " + hospitalId);
        } catch (Exception e) {
            log.error("Error communicating with Organization Service", e);
            throw new IntegrationException("Could not verify hospital existence: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> validateHospitalExistsSafe(Long hospitalId) {
        if (hospitalId == null) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("id", 101L);
            fallback.put("name", "Swarnika Hospitals");
            return fallback;
        }
        try {
            Map<String, Object> response = organizationClient.getHospitalById(hospitalId);
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                return (Map<String, Object>) response.get("data");
            }
        } catch (Exception e) {
            log.warn("Could not verify hospital existence via organizationClient: {}", e.getMessage());
        }
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("id", hospitalId);
        fallback.put("name", "Swarnika Hospitals");
        return fallback;
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> validateDepartmentExists(Long departmentId) {
        try {
            Map<String, Object> response = organizationClient.getDepartmentById(departmentId);
            if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                throw new IntegrationException("Department not found");
            }
            return (Map<String, Object>) response.get("data");
        } catch (FeignException.NotFound e) {
            throw new IntegrationException("Department not found with id: " + departmentId);
        } catch (Exception e) {
            log.error("Error communicating with Organization Service", e);
            throw new IntegrationException("Could not verify department existence: " + e.getMessage());
        }
    }
    
    private void validateDoctorHospitalAndDepartment(Map<String, Object> doctorData, Long hospitalId, Long departmentId) {
        // In real implementation, check doctor's hospital and department assignments
        // For phase 3 foundation, we assume the data object has assignments or we bypass if structure is complex
    }

    @SuppressWarnings("unchecked")
    private void validateDoctorAvailability(Long doctorId, LocalDate appointmentDate, LocalTime startTime, LocalTime endTime) {
        DayOfWeek requestedDay = appointmentDate.getDayOfWeek();
        try {
            Map<String, Object> response = doctorClient.getDoctorAvailability(doctorId);
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                List<Map<String, Object>> availabilities = (List<Map<String, Object>>) response.get("data");
                
                boolean isAvailable = false;
                if (availabilities != null) {
                    for (Map<String, Object> avail : availabilities) {
                        if (Boolean.TRUE.equals(avail.get("isActive"))) {
                            String dayStr = (String) avail.get("dayOfWeek");
                            if (requestedDay.name().equalsIgnoreCase(dayStr)) {
                                LocalTime availStart = LocalTime.parse((String) avail.get("startTime"));
                                LocalTime availEnd = LocalTime.parse((String) avail.get("endTime"));
                                
                                if ((startTime.isAfter(availStart) || startTime.equals(availStart)) &&
                                    (endTime.isBefore(availEnd) || endTime.equals(availEnd))) {
                                    isAvailable = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!isAvailable) {
                    throw new DoctorUnavailableException("Doctor is not available at the requested time on " + requestedDay);
                }
            } else {
                throw new IntegrationException("Failed to fetch doctor availability");
            }
        } catch (DoctorUnavailableException e) {
            throw e;
        } catch (FeignException e) {
            log.error("Error communicating with Doctor Service for availability", e);
            throw new IntegrationException("Could not verify doctor availability");
        }
    }

    private void checkDoubleBooking(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeAppointmentId) {
        List<Appointment> overlapping = appointmentRepository.findOverlappingAppointments(doctorId, date, startTime, endTime);
        
        if (excludeAppointmentId != null) {
            overlapping = overlapping.stream()
                    .filter(a -> !a.getId().equals(excludeAppointmentId))
                    .collect(Collectors.toList());
        }
        
        if (!overlapping.isEmpty()) {
            throw new AppointmentConflictException("The requested time slot conflicts with an existing appointment for this doctor.");
        }
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return mapToResponse(appointment, null, null, null);
    }

    private AppointmentResponse mapToResponse(Appointment appointment, Map<String, Object> patientData, Map<String, Object> doctorData, Map<String, Object> hospitalData) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(appointment.getId());
        res.setAppointmentId(appointment.getId());
        res.setAppointmentNumber(appointment.getAppointmentNumber());
        res.setPatientId(appointment.getPatientId());
        res.setDoctorId(appointment.getDoctorId());
        res.setHospitalId(appointment.getHospitalId());
        res.setDepartmentId(appointment.getDepartmentId());
        res.setAppointmentDate(appointment.getAppointmentDate());
        res.setStartTime(appointment.getStartTime());
        res.setEndTime(appointment.getEndTime());
        res.setStatus(appointment.getStatus());
        res.setAppointmentType(appointment.getAppointmentType());
        res.setBookingSource(appointment.getBookingSource());
        res.setReason(appointment.getReason());
        res.setNotes(appointment.getNotes());
        res.setCancellationReason(appointment.getCancellationReason());
        res.setCancelledAt(appointment.getCancelledAt());
        res.setCompletedAt(appointment.getCompletedAt());
        res.setCreatedAt(appointment.getCreatedAt());
        res.setUpdatedAt(appointment.getUpdatedAt());

        // Format slot (e.g. "10:00 AM") as shown in UI
        if (appointment.getStartTime() != null) {
            try {
                res.setSlot(appointment.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH)));
            } catch (Exception ignored) {
                res.setSlot(appointment.getStartTime().toString());
            }
        }

        // Resolve doctor name as shown in UI
        if (doctorData != null) {
            String firstName = (String) doctorData.get("firstName");
            String lastName = (String) doctorData.get("lastName");
            String name = (firstName != null ? firstName : "") + (lastName != null ? " " + lastName : "");
            if (!name.isBlank()) {
                res.setDoctorName(name.startsWith("Dr.") ? name : "Dr. " + name.trim());
            }
        }
        if (res.getDoctorName() == null && appointment.getDoctorId() != null) {
            res.setDoctorName(resolveDoctorNameFallback(appointment.getDoctorId()));
        }

        // Resolve hospital name as shown in UI
        if (hospitalData != null && hospitalData.get("name") != null) {
            res.setHospitalName((String) hospitalData.get("name"));
        } else {
            res.setHospitalName("Swarnika Hospitals");
        }

        // Resolve patient name
        if (patientData != null) {
            String firstName = (String) patientData.get("firstName");
            String lastName = (String) patientData.get("lastName");
            String name = (firstName != null ? firstName : "") + (lastName != null ? " " + lastName : "");
            if (!name.isBlank()) {
                res.setPatientName(name.trim());
            }
        }
        if (res.getPatientName() == null && appointment.getNotes() != null && appointment.getNotes().contains("Patient Contact: ")) {
            try {
                String note = appointment.getNotes();
                int idx = note.indexOf("Patient Contact: ");
                String sub = note.substring(idx + "Patient Contact: ".length());
                int endIdx = sub.indexOf("(");
                if (endIdx > 0) {
                    res.setPatientName(sub.substring(0, endIdx).trim());
                } else {
                    res.setPatientName(sub.trim());
                }
            } catch (Exception ignored) {}
        }
        if (res.getPatientName() == null) {
            res.setPatientName("Guest Patient");
        }

        return res;
    }

    private String resolveDoctorNameFallback(Long doctorId) {
        try {
            Map<String, Object> doc = validateDoctorExists(doctorId);
            if (doc != null) {
                String firstName = (String) doc.get("firstName");
                String lastName = (String) doc.get("lastName");
                String name = (firstName != null ? firstName : "") + (lastName != null ? " " + lastName : "");
                if (!name.isBlank()) {
                    return name.startsWith("Dr.") ? name : "Dr. " + name.trim();
                }
            }
        } catch (Exception ignored) {}

        if (Long.valueOf(7L).equals(doctorId)) return "Dr. Rajesh Patel";
        if (Long.valueOf(6L).equals(doctorId)) return "Dr. John Doe";
        if (Long.valueOf(8L).equals(doctorId)) return "Dr. Priya Sharma";
        if (Long.valueOf(9L).equals(doctorId)) return "Dr. Amit Verma";
        if (Long.valueOf(10L).equals(doctorId)) return "Dr. Ananya Patel";
        if (Long.valueOf(11L).equals(doctorId)) return "Dr. Sneha Kulkarni";
        return "Doctor #" + doctorId;
    }

    private void publishAppointmentEvent(Appointment appointment, Map<String, Object> patientData, Map<String, Object> doctorData, Map<String, Object> hospitalData, String topic, String eventType) {
        try {
            com.swarnikacare.appointment.event.AppointmentBookedEvent event = new com.swarnikacare.appointment.event.AppointmentBookedEvent();
            event.setEventId(java.util.UUID.randomUUID().toString());
            event.setAppointmentId(appointment.getId());
            event.setPatientId(appointment.getPatientId());
            event.setDoctorId(appointment.getDoctorId());
            event.setAppointmentDate(appointment.getAppointmentDate().toString());
            event.setTimeSlot(appointment.getStartTime().toString() + "-" + appointment.getEndTime().toString());
            event.setAppointmentStatus(appointment.getStatus().name());

            if (patientData != null) {
                event.setPatientName((String) patientData.get("firstName") + " " + patientData.get("lastName"));
                event.setPatientEmail((String) patientData.get("email"));
            }

            if (doctorData != null) {
                event.setDoctorName("Dr. " + doctorData.get("firstName") + " " + doctorData.get("lastName"));
            }
            
            if (hospitalData != null) {
                event.setHospitalName((String) hospitalData.get("name"));
                event.setHospitalAddress((String) hospitalData.get("address"));
            }

            String payload = objectMapper.writeValueAsString(event);
            
            com.swarnikacare.appointment.outbox.OutboxEvent outboxEvent = new com.swarnikacare.appointment.outbox.OutboxEvent(
                event.getEventId(),
                "Appointment",
                appointment.getId().toString(),
                eventType,
                topic,
                payload,
                "PENDING"
            );
            
            outboxEventRepository.save(outboxEvent);
        } catch (Exception e) {
            log.error("Failed to save OutboxEvent for appointmentId: {}", appointment.getId(), e);
            throw new RuntimeException("Failed to save OutboxEvent", e);
        }
    }
    
    private String generateAppointmentNumber() {
        return "APT-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (System.currentTimeMillis() % 100000);
    }
    
    private BookingSource determineBookingSource() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            if (hasRole(auth, "ROLE_PATIENT")) return BookingSource.PATIENT_PORTAL;
            if (hasRole(auth, "ROLE_RECEPTIONIST")) return BookingSource.RECEPTION;
            if (hasRole(auth, "ROLE_DOCTOR")) return BookingSource.DOCTOR;
            if (hasRole(auth, "ROLE_HOSPITAL_ADMIN") || hasRole(auth, "ROLE_SUPER_ADMIN")) return BookingSource.ADMIN;
        }
        return BookingSource.PATIENT_PORTAL;
    }
    
    private void authorizePatientAction(Map<String, Object> patientData) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) return;
        if (hasRole(auth, "ROLE_SUPER_ADMIN") || hasRole(auth, "ROLE_HOSPITAL_ADMIN") || hasRole(auth, "ROLE_RECEPTIONIST")) return;
        
        if (hasRole(auth, "ROLE_PATIENT")) {
            String userId = auth.getName();
            if (patientData != null && !userId.equals(patientData.get("userId"))) {
                throw new AccessDeniedException("You do not have permission to access this patient's appointments");
            }
        }
    }
    
    private void authorizeDoctorAction(Map<String, Object> doctorData) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) return;
        if (hasRole(auth, "ROLE_SUPER_ADMIN") || hasRole(auth, "ROLE_HOSPITAL_ADMIN") || hasRole(auth, "ROLE_RECEPTIONIST")) return;
        
        if (hasRole(auth, "ROLE_DOCTOR")) {
            // Compare JWT userId (from claims) with doctor entity's userId
            Long jwtUserId = null;
            if (auth.getDetails() instanceof CustomAuthenticationDetails customDetails) {
                jwtUserId = customDetails.getUserId();
            }
            if (doctorData != null && jwtUserId != null) {
                Object doctorUserId = doctorData.get("userId");
                String doctorUserIdStr = doctorUserId != null ? String.valueOf(doctorUserId) : null;
                if (!String.valueOf(jwtUserId).equals(doctorUserIdStr)) {
                    throw new AccessDeniedException("You do not have permission to access this doctor's appointments");
                }
            }
        }
    }
    
    private void authorizeAppointmentRead(Appointment appointment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) return;
        if (hasRole(auth, "ROLE_SUPER_ADMIN")) return;
        
        if (hasRole(auth, "ROLE_HOSPITAL_ADMIN") || hasRole(auth, "ROLE_RECEPTIONIST")) {
            authorizeHospitalAction(appointment.getHospitalId());
            return;
        }
        
        if (hasRole(auth, "ROLE_PATIENT")) {
            Map<String, Object> patientData = validatePatientExists(appointment.getPatientId());
            authorizePatientAction(patientData);
        } else if (hasRole(auth, "ROLE_DOCTOR")) {
            Map<String, Object> doctorData = validateDoctorExists(appointment.getDoctorId());
            authorizeDoctorAction(doctorData);
        }
    }
    
    private void authorizeAppointmentAction(Appointment appointment) {
        // Only admin/reception or the owning patient/doctor can act on an appointment
        authorizeAppointmentRead(appointment);
        authorizeHospitalAction(appointment.getHospitalId());
        // Additional checks like "patients cannot complete appointments" can go here
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (hasRole(auth, "ROLE_PATIENT")) {
             // Let patients cancel, but not complete. (Handled via endpoints usually)
        }
    }
    
    private void authorizeHospitalAction(Long hospitalId) {
        if (hospitalId == null) {
            return;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return;
        }
        if (hasRole(auth, "ROLE_SUPER_ADMIN")) {
            return;
        }

        Long userHospitalId = null;
        if (auth.getDetails() instanceof com.swarnikacare.appointment.security.CustomAuthenticationDetails customDetails) {
            userHospitalId = customDetails.getHospitalId();
        }

        if (hasRole(auth, "ROLE_HOSPITAL_ADMIN") || hasRole(auth, "ROLE_RECEPTIONIST")) {
            if (userHospitalId != null && !userHospitalId.equals(hospitalId)) {
                throw new AccessDeniedException("Access denied: You are not authorized for hospital ID: " + hospitalId);
            }
        }
    }
    
    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(role));
    }
}
