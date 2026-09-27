package com.swarnikacare.appointment.service;

import com.swarnikacare.appointment.client.DoctorClient;
import com.swarnikacare.appointment.client.OrganizationClient;
import com.swarnikacare.appointment.client.PatientClient;
import com.swarnikacare.appointment.dto.AppointmentCreateRequest;
import com.swarnikacare.appointment.entity.AppointmentType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
public class AppointmentConcurrencyTest {

    @Autowired
    private AppointmentService appointmentService;

    @MockBean
    private DoctorClient doctorClient;

    @MockBean
    private PatientClient patientClient;

    @MockBean
    private OrganizationClient organizationClient;

    @Autowired
    private com.swarnikacare.appointment.repository.AppointmentRepository appointmentRepository;

    @Autowired
    private com.swarnikacare.appointment.repository.DoctorScheduleLockRepository doctorScheduleLockRepository;

    @Test
    public void testConcurrentDoubleBooking() throws InterruptedException {
        appointmentRepository.deleteAllInBatch();
        
        // Pre-create the lock to avoid insert deadlocks
        doctorScheduleLockRepository.save(new com.swarnikacare.appointment.entity.DoctorScheduleLock(1L));

        // Setup mock security
        SecurityContextImpl securityContext = new SecurityContextImpl();
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken("super_admin_id", null, authorities);
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Mock Feign Clients
        Map<String, Object> successResponse = new HashMap<>();
        successResponse.put("success", true);
        Map<String, Object> data = new HashMap<>();
        data.put("userId", "test_user");
        successResponse.put("data", data);

        when(patientClient.getPatientById(anyLong())).thenReturn(successResponse);
        when(doctorClient.getDoctorById(anyLong())).thenReturn(successResponse);
        when(organizationClient.getHospitalById(anyLong())).thenReturn(successResponse);
        when(organizationClient.getDepartmentById(anyLong())).thenReturn(successResponse);

        // Mock Doctor Availability
        Map<String, Object> availabilityResponse = new HashMap<>();
        availabilityResponse.put("success", true);
        List<Map<String, Object>> availabilities = new ArrayList<>();
        Map<String, Object> avail = new HashMap<>();
        avail.put("isActive", true);
        avail.put("dayOfWeek", LocalDate.now().plusDays(1).getDayOfWeek().name());
        avail.put("startTime", "09:00");
        avail.put("endTime", "17:00");
        availabilities.add(avail);
        availabilityResponse.put("data", availabilities);
        when(doctorClient.getDoctorAvailability(anyLong())).thenReturn(availabilityResponse);

        int numberOfThreads = 5;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            executorService.submit(() -> {
                try {
                    SecurityContextHolder.setContext(securityContext);
                    startLatch.await();
                    
                    AppointmentCreateRequest request = new AppointmentCreateRequest();
                    request.setPatientId(1L);
                    request.setDoctorId(1L);
                    request.setHospitalId(1L);
                    request.setDepartmentId(1L);
                    request.setAppointmentDate(LocalDate.now().plusDays(1));
                    request.setStartTime(LocalTime.of(10, 0));
                    request.setEndTime(LocalTime.of(11, 0));
                    request.setAppointmentType(AppointmentType.OPD);
                    request.setReason("Test");

                    appointmentService.createAppointment(request);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    System.out.println("Thread caught: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                    if (e.getClass().getSimpleName().equals("AppointmentConflictException") || 
                        e.getClass().getSimpleName().equals("DataIntegrityViolationException") ||
                        e.getClass().getSimpleName().equals("CannotAcquireLockException") ||
                        e.getClass().getSimpleName().equals("PessimisticLockingFailureException")) {
                        conflictCount.incrementAndGet();
                    } else {
                        System.err.println("Thread failed with unexpected exception: " + e.getMessage());
                        e.printStackTrace();
                        throw new RuntimeException(e);
                    }
                } finally {
                    endLatch.countDown();
                }
            });
        }

        // Release all threads simultaneously
        startLatch.countDown();
        endLatch.await();
        executorService.shutdown();

        // Exactly ONE booking should succeed
        System.out.println("Success Count: " + successCount.get());
        System.out.println("Conflict Count: " + conflictCount.get());
        assertEquals(1, successCount.get());
        assertEquals(4, conflictCount.get());
    }
}
