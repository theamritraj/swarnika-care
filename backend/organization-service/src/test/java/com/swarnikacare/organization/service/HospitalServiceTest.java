package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.HospitalCreateRequest;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.entity.HospitalType;
import com.swarnikacare.organization.repository.HospitalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class HospitalServiceTest {

    @Mock
    private HospitalRepository hospitalRepository;

    @InjectMocks
    private HospitalService hospitalService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createHospital_Success() {
        HospitalCreateRequest request = new HospitalCreateRequest();
        request.setCode("HOS-TEST-1");
        request.setName("Test Hospital");
        request.setCity("Sasaram");
        request.setTotalBeds(150);

        when(hospitalRepository.findByCode("HOS-TEST-1")).thenReturn(Optional.empty());

        Hospital saved = new Hospital();
        saved.setId(10L);
        saved.setCode("HOS-TEST-1");
        saved.setName("Test Hospital");
        saved.setCity("Sasaram");
        saved.setStatus("ACTIVE");

        when(hospitalRepository.save(any(Hospital.class))).thenReturn(saved);

        Hospital result = hospitalService.createHospital(request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("HOS-TEST-1", result.getCode());
        assertEquals("ACTIVE", result.getStatus());
    }

    @Test
    void createHospital_DuplicateCode_ThrowsException() {
        HospitalCreateRequest request = new HospitalCreateRequest();
        request.setCode("HOS-DUP");
        request.setName("Duplicate Hospital");

        Hospital existing = new Hospital();
        existing.setId(1L);
        existing.setCode("HOS-DUP");

        when(hospitalRepository.findByCode("HOS-DUP")).thenReturn(Optional.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> hospitalService.createHospital(request));
        assertEquals("Hospital code already exists", ex.getMessage());
    }

    @Test
    void getHospitalById_NotFound_ThrowsException() {
        when(hospitalRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> hospitalService.getHospitalById(999L));
        assertEquals("Hospital not found", ex.getMessage());
    }

    @Test
    void updateHospital_Success() {
        Hospital existing = new Hospital();
        existing.setId(10L);
        existing.setCode("HOS-TEST-1");
        existing.setName("Original Name");
        existing.setTotalBeds(100);

        when(hospitalRepository.findById(10L)).thenReturn(Optional.of(existing));

        HospitalCreateRequest updateReq = new HospitalCreateRequest();
        updateReq.setName("Updated Hospital Name");
        updateReq.setTotalBeds(200);

        when(hospitalRepository.save(any(Hospital.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Hospital updated = hospitalService.updateHospital(10L, updateReq);

        assertNotNull(updated);
        assertEquals("Updated Hospital Name", updated.getName());
        assertEquals(200, updated.getTotalBeds());
    }

    @Test
    void createHospital_MaternityWomenHospital_Success() {
        HospitalCreateRequest request = new HospitalCreateRequest();
        request.setCode("SC-MAT-01");
        request.setName("Swarnika Maternity Care");
        request.setType(HospitalType.MATERNITY_WOMEN_HOSPITAL);

        when(hospitalRepository.findByCode("SC-MAT-01")).thenReturn(Optional.empty());

        Hospital saved = new Hospital();
        saved.setId(11L);
        saved.setCode("SC-MAT-01");
        saved.setType(HospitalType.MATERNITY_WOMEN_HOSPITAL);
        saved.setStatus("ACTIVE");

        when(hospitalRepository.save(any(Hospital.class))).thenReturn(saved);

        Hospital result = hospitalService.createHospital(request);

        assertNotNull(result);
        assertEquals(HospitalType.MATERNITY_WOMEN_HOSPITAL, result.getType());
    }

    @Test
    void updateHospital_Type_Success() {
        Hospital existing = new Hospital();
        existing.setId(10L);
        existing.setCode("HOS-TEST-1");
        existing.setName("Original Name");
        existing.setType(HospitalType.GENERAL_HOSPITAL);

        when(hospitalRepository.findById(10L)).thenReturn(Optional.of(existing));

        HospitalCreateRequest updateReq = new HospitalCreateRequest();
        updateReq.setName("Original Name");
        updateReq.setType(HospitalType.SUPER_SPECIALTY_HOSPITAL);

        when(hospitalRepository.save(any(Hospital.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Hospital updated = hospitalService.updateHospital(10L, updateReq);

        assertNotNull(updated);
        assertEquals(HospitalType.SUPER_SPECIALTY_HOSPITAL, updated.getType());
    }
}
