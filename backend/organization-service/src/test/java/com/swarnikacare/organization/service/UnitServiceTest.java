package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.UnitRequest;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.exception.InvalidHierarchyException;
import com.swarnikacare.organization.exception.UnitNotFoundException;
import com.swarnikacare.organization.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UnitServiceTest {

    @Mock private UnitRepository unitRepository;
    @Mock private FloorRepository floorRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private RoomRepository roomRepository;
    @Mock private NursingStationRepository nursingStationRepository;

    @InjectMocks private UnitService unitService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAllByFloor_Success() {
        Unit u = new Unit();
        u.setId(20L);
        u.setFloorId(10L);
        u.setCode("ICU-1");

        when(unitRepository.findByFloorId(10L)).thenReturn(List.of(u));

        List<Unit> result = unitService.findAllByFloor(10L);
        assertEquals(1, result.size());
        assertEquals("ICU-1", result.get(0).getCode());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(unitRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(UnitNotFoundException.class, () -> unitService.findById(999L));
    }

    @Test
    void create_FloorBuildingMismatch_ThrowsInvalidHierarchyException() {
        UnitRequest req = new UnitRequest();
        req.setHospitalId(101L);
        req.setBuildingId(2L); // mismatch!
        req.setFloorId(10L);
        req.setCode("WARD-A");

        Floor f = new Floor();
        f.setId(10L);
        f.setBuildingId(1L);
        f.setHospitalId(101L);

        when(floorRepository.findById(10L)).thenReturn(Optional.of(f));

        assertThrows(InvalidHierarchyException.class, () -> unitService.create(req));
    }
}
