package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.OrganizationClient;
import com.swarnikacare.doctor.dto.DoctorAvailabilityRequest;
import com.swarnikacare.doctor.dto.DoctorAvailabilityResponse;
import com.swarnikacare.doctor.entity.DoctorAvailability;
import com.swarnikacare.doctor.exception.DoctorNotFoundException;
import com.swarnikacare.doctor.exception.InvalidHierarchyException;
import com.swarnikacare.doctor.repository.DoctorAvailabilityRepository;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DoctorAvailabilityServiceImplTest {

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorHospitalAssignmentRepository assignmentRepository;

    @Mock
    private OrganizationClient organizationClient;

    @InjectMocks
    private DoctorAvailabilityServiceImpl availabilityService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Map<String, Object> createOrgResponse(Long id, Long hospitalId) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        if (hospitalId != null) {
            data.put("hospitalId", hospitalId);
        }
        resp.put("data", data);
        return resp;
    }

    private DoctorAvailabilityRequest createReq(Long hId, Long dId, DayOfWeek day, LocalTime start, LocalTime end) {
        DoctorAvailabilityRequest req = new DoctorAvailabilityRequest();
        req.setHospitalId(hId);
        req.setDepartmentId(dId);
        req.setDayOfWeek(day);
        req.setStartTime(start);
        req.setEndTime(end);
        return req;
    }

    @Test
    void testAddAvailability_Success() {
        Long doctorId = 1L;
        DoctorAvailabilityRequest req = createReq(101L, 101L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(12, 0));

        when(doctorRepository.existsById(doctorId)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(101L)).thenReturn(createOrgResponse(101L, 101L));
        when(assignmentRepository.existsByDoctorIdAndHospitalId(doctorId, 101L)).thenReturn(true);
        when(assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(doctorId, 101L, 101L)).thenReturn(true);
        when(availabilityRepository.findOverlappingSlots(any(), any(), any(), any(), any())).thenReturn(Collections.emptyList());

        DoctorAvailability saved = new DoctorAvailability();
        saved.setId(10L);
        saved.setDoctorId(doctorId);
        saved.setHospitalId(101L);
        saved.setDepartmentId(101L);
        saved.setDayOfWeek(DayOfWeek.MONDAY);
        saved.setStartTime(LocalTime.of(9, 0));
        saved.setEndTime(LocalTime.of(12, 0));
        saved.setIsActive(true);
        when(availabilityRepository.save(any())).thenReturn(saved);

        DoctorAvailabilityResponse res = availabilityService.addAvailability(doctorId, req);

        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals(DayOfWeek.MONDAY, res.getDayOfWeek());
    }

    @Test
    void testAddAvailability_DoctorNotFound() {
        when(doctorRepository.existsById(999L)).thenReturn(false);
        DoctorAvailabilityRequest req = createReq(101L, 101L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(12, 0));

        assertThrows(DoctorNotFoundException.class, () -> availabilityService.addAvailability(999L, req));
    }

    @Test
    void testAddAvailability_HospitalInvalid() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(999L)).thenReturn(null);
        DoctorAvailabilityRequest req = createReq(999L, 101L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(12, 0));

        assertThrows(IllegalArgumentException.class, () -> availabilityService.addAvailability(1L, req));
    }

    @Test
    void testAddAvailability_DepartmentBelongsToAnotherHospital() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(102L)).thenReturn(createOrgResponse(102L, 102L));
        DoctorAvailabilityRequest req = createReq(101L, 102L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(12, 0));

        assertThrows(InvalidHierarchyException.class, () -> availabilityService.addAvailability(1L, req));
    }

    @Test
    void testAddAvailability_DoctorNotAssignedToHospital() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(101L)).thenReturn(createOrgResponse(101L, 101L));
        when(assignmentRepository.existsByDoctorIdAndHospitalId(1L, 101L)).thenReturn(false);
        DoctorAvailabilityRequest req = createReq(101L, 101L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(12, 0));

        assertThrows(IllegalArgumentException.class, () -> availabilityService.addAvailability(1L, req));
    }

    @Test
    void testAddAvailability_DoctorNotAssignedToDepartment() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(101L)).thenReturn(createOrgResponse(101L, 101L));
        when(assignmentRepository.existsByDoctorIdAndHospitalId(1L, 101L)).thenReturn(true);
        when(assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(1L, 101L, 101L)).thenReturn(false);
        DoctorAvailabilityRequest req = createReq(101L, 101L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(12, 0));

        assertThrows(IllegalArgumentException.class, () -> availabilityService.addAvailability(1L, req));
    }

    @Test
    void testAddAvailability_StartAfterOrEqualEnd() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(101L)).thenReturn(createOrgResponse(101L, 101L));
        when(assignmentRepository.existsByDoctorIdAndHospitalId(1L, 101L)).thenReturn(true);
        when(assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(1L, 101L, 101L)).thenReturn(true);
        // Start 14:00, End 10:00
        DoctorAvailabilityRequest req = createReq(101L, 101L, DayOfWeek.MONDAY, LocalTime.of(14, 0), LocalTime.of(10, 0));

        assertThrows(IllegalArgumentException.class, () -> availabilityService.addAvailability(1L, req));
    }

    @Test
    void testAddAvailability_OverlappingSlots() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(101L)).thenReturn(createOrgResponse(101L, 101L));
        when(assignmentRepository.existsByDoctorIdAndHospitalId(1L, 101L)).thenReturn(true);
        when(assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(1L, 101L, 101L)).thenReturn(true);

        DoctorAvailability existing = new DoctorAvailability();
        existing.setId(1L);
        when(availabilityRepository.findOverlappingSlots(any(), any(), any(), any(), any())).thenReturn(List.of(existing));

        DoctorAvailabilityRequest req = createReq(101L, 101L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(12, 0));
        assertThrows(IllegalArgumentException.class, () -> availabilityService.addAvailability(1L, req));
    }

    @Test
    void testGetAvailability_GlobalFilters() {
        DoctorAvailability da = new DoctorAvailability();
        da.setId(1L);
        da.setDoctorId(1L);
        da.setHospitalId(101L);
        da.setDepartmentId(101L);
        da.setDayOfWeek(DayOfWeek.MONDAY);
        da.setStartTime(LocalTime.of(9, 0));
        da.setEndTime(LocalTime.of(12, 0));
        da.setIsActive(true);

        when(availabilityRepository.findByDoctorIdAndHospitalIdAndDepartmentId(1L, 101L, 101L)).thenReturn(List.of(da));
        List<DoctorAvailabilityResponse> res = availabilityService.getAvailability(101L, 101L, 1L);
        assertEquals(1, res.size());
    }

    @Test
    void testDeleteAvailability() {
        DoctorAvailability da = new DoctorAvailability();
        da.setId(1L);
        when(availabilityRepository.findById(1L)).thenReturn(Optional.of(da));

        availabilityService.deleteAvailability(1L);
        verify(availabilityRepository, times(1)).delete(da);
    }
}
