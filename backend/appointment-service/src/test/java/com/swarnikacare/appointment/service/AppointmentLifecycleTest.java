package com.swarnikacare.appointment.service;

import com.swarnikacare.appointment.dto.AppointmentCancelRequest;
import com.swarnikacare.appointment.dto.AppointmentRescheduleRequest;
import com.swarnikacare.appointment.dto.AppointmentResponse;
import com.swarnikacare.appointment.entity.Appointment;
import com.swarnikacare.appointment.entity.AppointmentStatus;
import com.swarnikacare.appointment.entity.AppointmentType;
import com.swarnikacare.appointment.entity.BookingSource;
import com.swarnikacare.appointment.exception.InvalidAppointmentTimeException;
import com.swarnikacare.appointment.repository.AppointmentRepository;
import com.swarnikacare.appointment.repository.DoctorScheduleLockRepository;
import com.swarnikacare.appointment.client.DoctorClient;
import com.swarnikacare.appointment.client.PatientClient;
import com.swarnikacare.appointment.client.OrganizationClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * Phase 3 Hardening — Appointment Lifecycle Tests
 *
 * Covers all valid/invalid state transitions required by the Phase 3 audit:
 *   SCHEDULED → CONFIRMED  (valid)
 *   SCHEDULED → CANCELLED  (valid)
 *   CONFIRMED → COMPLETED  (valid)
 *   CONFIRMED → CANCELLED  (valid)
 *   CONFIRMED → NO_SHOW    (valid)
 *   CANCELLED → COMPLETED  (INVALID → expect exception)
 *   CANCELLED → CONFIRMED  (INVALID → expect exception)
 *   COMPLETED → CANCELLED  (INVALID → expect exception)
 *   NO_SHOW   → COMPLETED  (INVALID → expect exception)
 *
 * Also covers reschedule guard-rails and cancellation data-integrity.
 */
@SpringBootTest
@ActiveProfiles("test")
public class AppointmentLifecycleTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorScheduleLockRepository doctorScheduleLockRepository;

    @MockBean
    private PatientClient patientClient;

    @MockBean
    private DoctorClient doctorClient;

    @MockBean
    private OrganizationClient organizationClient;

    private Appointment savedScheduled;

    @BeforeEach
    void setup() {
        appointmentRepository.deleteAllInBatch();
        doctorScheduleLockRepository.deleteAllInBatch();

        // SUPER_ADMIN context — bypasses ownership checks
        SecurityContextImpl ctx = new SecurityContextImpl();
        ctx.setAuthentication(new UsernamePasswordAuthenticationToken(
                "super_admin", null,
                List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
        ));
        SecurityContextHolder.setContext(ctx);

        // Seed doctor availability mock — cover both seed day (now+1) and reschedule target (now+2)
        Map<String, Object> availResponse = new HashMap<>();
        availResponse.put("success", true);
        List<Map<String, Object>> availList = new ArrayList<>();
        for (int offset = 1; offset <= 3; offset++) {
            Map<String, Object> avail = new HashMap<>();
            avail.put("isActive", true);
            avail.put("dayOfWeek", LocalDate.now().plusDays(offset).getDayOfWeek().name());
            avail.put("startTime", "09:00");
            avail.put("endTime", "17:00");
            availList.add(avail);
        }
        availResponse.put("data", availList);
        when(doctorClient.getDoctorAvailability(anyLong())).thenReturn(availResponse);

        // Pre-save a SCHEDULED appointment directly via repository (bypasses all the creation checks,
        // letting us focus purely on lifecycle transitions)
        savedScheduled = new Appointment();
        savedScheduled.setPatientId(1L);
        savedScheduled.setDoctorId(1L);
        savedScheduled.setHospitalId(1L);
        savedScheduled.setDepartmentId(1L);
        savedScheduled.setAppointmentDate(LocalDate.now().plusDays(1));
        savedScheduled.setStartTime(LocalTime.of(10, 0));
        savedScheduled.setEndTime(LocalTime.of(10, 30));
        savedScheduled.setAppointmentNumber("APT-LIFECYCLE-1");
        savedScheduled.setAppointmentType(AppointmentType.OPD);
        savedScheduled.setBookingSource(BookingSource.SYSTEM);
        savedScheduled.setStatus(AppointmentStatus.SCHEDULED);
        savedScheduled.setReason("Lifecycle test");
        savedScheduled = appointmentRepository.save(savedScheduled);
    }

    // ─── VALID TRANSITIONS ─────────────────────────────────────────────────────

    @Test
    void scheduledToConfirmed_succeeds() {
        AppointmentResponse r = appointmentService.confirmAppointment(savedScheduled.getId());
        assertEquals(AppointmentStatus.CONFIRMED, r.getStatus());
    }

    @Test
    void scheduledToCancelled_succeeds() {
        AppointmentCancelRequest req = new AppointmentCancelRequest();
        req.setReason("Patient request");
        AppointmentResponse r = appointmentService.cancelAppointment(savedScheduled.getId(), req);
        assertEquals(AppointmentStatus.CANCELLED, r.getStatus());
        assertNotNull(r.getCancellationReason(), "cancellationReason must be stored");
        assertNotNull(r.getCancelledAt(), "cancelledAt must be stored");
    }

    @Test
    void confirmedToCompleted_succeeds() {
        // Move to CONFIRMED first
        savedScheduled.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(savedScheduled);

        AppointmentResponse r = appointmentService.completeAppointment(savedScheduled.getId());
        assertEquals(AppointmentStatus.COMPLETED, r.getStatus());
        assertNotNull(r.getCompletedAt(), "completedAt must be stored");
    }

    @Test
    void confirmedToCancelled_succeeds() {
        savedScheduled.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(savedScheduled);

        AppointmentCancelRequest req = new AppointmentCancelRequest();
        req.setReason("Doctor unavailable");
        AppointmentResponse r = appointmentService.cancelAppointment(savedScheduled.getId(), req);
        assertEquals(AppointmentStatus.CANCELLED, r.getStatus());
    }

    @Test
    void confirmedToNoShow_succeeds() {
        savedScheduled.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(savedScheduled);

        AppointmentResponse r = appointmentService.noShowAppointment(savedScheduled.getId());
        assertEquals(AppointmentStatus.NO_SHOW, r.getStatus());
    }

    @Test
    void scheduledToNoShow_succeeds() {
        AppointmentResponse r = appointmentService.noShowAppointment(savedScheduled.getId());
        assertEquals(AppointmentStatus.NO_SHOW, r.getStatus());
    }

    // ─── INVALID TRANSITIONS ───────────────────────────────────────────────────

    @Test
    void cancelledToCompleted_throws() {
        savedScheduled.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(savedScheduled);
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.completeAppointment(savedScheduled.getId()));
    }

    @Test
    void cancelledToConfirmed_throws() {
        savedScheduled.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(savedScheduled);
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.confirmAppointment(savedScheduled.getId()));
    }

    @Test
    void completedToCancelled_throws() {
        savedScheduled.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(savedScheduled);
        AppointmentCancelRequest req = new AppointmentCancelRequest();
        req.setReason("Attempt");
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.cancelAppointment(savedScheduled.getId(), req));
    }

    @Test
    void noShowToCompleted_throws() {
        savedScheduled.setStatus(AppointmentStatus.NO_SHOW);
        appointmentRepository.save(savedScheduled);
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.completeAppointment(savedScheduled.getId()));
    }

    @Test
    void duplicateCancellation_throws() {
        savedScheduled.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(savedScheduled);
        AppointmentCancelRequest req = new AppointmentCancelRequest();
        req.setReason("Duplicate attempt");
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.cancelAppointment(savedScheduled.getId(), req));
    }

    // ─── RESCHEDULE GUARDS ─────────────────────────────────────────────────────

    @Test
    void rescheduleCancelledAppointment_throws() {
        savedScheduled.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(savedScheduled);

        AppointmentRescheduleRequest req = new AppointmentRescheduleRequest();
        req.setNewAppointmentDate(LocalDate.now().plusDays(3));
        req.setNewStartTime(LocalTime.of(11, 0));
        req.setNewEndTime(LocalTime.of(11, 30));
        req.setReason("Attempt");
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.rescheduleAppointment(savedScheduled.getId(), req));
    }

    @Test
    void rescheduleCompletedAppointment_throws() {
        savedScheduled.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(savedScheduled);

        AppointmentRescheduleRequest req = new AppointmentRescheduleRequest();
        req.setNewAppointmentDate(LocalDate.now().plusDays(3));
        req.setNewStartTime(LocalTime.of(11, 0));
        req.setNewEndTime(LocalTime.of(11, 30));
        req.setReason("Attempt");
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.rescheduleAppointment(savedScheduled.getId(), req));
    }

    @Test
    void rescheduleNoShowAppointment_throws() {
        savedScheduled.setStatus(AppointmentStatus.NO_SHOW);
        appointmentRepository.save(savedScheduled);

        AppointmentRescheduleRequest req = new AppointmentRescheduleRequest();
        req.setNewAppointmentDate(LocalDate.now().plusDays(3));
        req.setNewStartTime(LocalTime.of(11, 0));
        req.setNewEndTime(LocalTime.of(11, 30));
        req.setReason("Attempt");
        assertThrows(InvalidAppointmentTimeException.class,
                () -> appointmentService.rescheduleAppointment(savedScheduled.getId(), req));
    }

    @Test
    void rescheduled_appointmentIdentity_unchanged() {
        // Reschedule a valid SCHEDULED appointment
        doctorScheduleLockRepository.save(new com.swarnikacare.appointment.entity.DoctorScheduleLock(1L));

        AppointmentRescheduleRequest req = new AppointmentRescheduleRequest();
        req.setNewAppointmentDate(LocalDate.now().plusDays(2));
        req.setNewStartTime(LocalTime.of(11, 0));
        req.setNewEndTime(LocalTime.of(11, 30));
        req.setReason("Patient requested new time");

        AppointmentResponse r = appointmentService.rescheduleAppointment(savedScheduled.getId(), req);

        // Identity must not change
        assertEquals(savedScheduled.getId(), r.getId());
        assertEquals("APT-LIFECYCLE-1", r.getAppointmentNumber());
        assertEquals(AppointmentStatus.SCHEDULED, r.getStatus());
        // New date/time applied
        assertEquals(LocalDate.now().plusDays(2), r.getAppointmentDate());
    }

    // ─── CANCELLATION DATA INTEGRITY ───────────────────────────────────────────

    @Test
    void cancellation_recordNotDeleted() {
        AppointmentCancelRequest req = new AppointmentCancelRequest();
        req.setReason("Test cancel");
        appointmentService.cancelAppointment(savedScheduled.getId(), req);

        // Record must still exist in DB
        assertTrue(appointmentRepository.existsById(savedScheduled.getId()),
                "Cancelled appointment must NOT be deleted from DB");
    }
}
