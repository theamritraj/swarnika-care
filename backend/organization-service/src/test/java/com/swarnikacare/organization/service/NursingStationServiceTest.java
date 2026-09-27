package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.NursingStationRequest;
import com.swarnikacare.organization.entity.NursingStation;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.exception.InvalidHierarchyException;
import com.swarnikacare.organization.exception.NursingStationNotFoundException;
import com.swarnikacare.organization.repository.NursingStationRepository;
import com.swarnikacare.organization.repository.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NursingStationServiceTest {

    @Mock private NursingStationRepository nursingStationRepository;
    @Mock private UnitRepository unitRepository;

    @InjectMocks private NursingStationService nursingStationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAllByUnit_Success() {
        NursingStation ns = new NursingStation();
        ns.setId(50L);
        ns.setUnitId(20L);
        ns.setCode("NS-ICU");

        when(nursingStationRepository.findByUnitId(20L)).thenReturn(List.of(ns));

        List<NursingStation> result = nursingStationService.findAllByUnit(20L);
        assertEquals(1, result.size());
        assertEquals("NS-ICU", result.get(0).getCode());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(nursingStationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NursingStationNotFoundException.class, () -> nursingStationService.findById(999L));
    }

    @Test
    void create_UnitHierarchyMismatch_ThrowsInvalidHierarchyException() {
        NursingStationRequest req = new NursingStationRequest();
        req.setHospitalId(101L);
        req.setBuildingId(1L);
        req.setFloorId(99L); // mismatch!
        req.setUnitId(20L);
        req.setCode("NS-01");

        Unit u = new Unit();
        u.setId(20L);
        u.setHospitalId(101L);
        u.setBuildingId(1L);
        u.setFloorId(10L); // actual floor

        when(unitRepository.findById(20L)).thenReturn(Optional.of(u));

        assertThrows(InvalidHierarchyException.class, () -> nursingStationService.create(req));
    }
}
