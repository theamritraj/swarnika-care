package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.FloorRequest;
import com.swarnikacare.organization.entity.Building;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.exception.FloorNotFoundException;
import com.swarnikacare.organization.exception.InvalidHierarchyException;
import com.swarnikacare.organization.repository.BuildingRepository;
import com.swarnikacare.organization.repository.FloorRepository;
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

class FloorServiceTest {

    @Mock private FloorRepository floorRepository;
    @Mock private BuildingRepository buildingRepository;
    @Mock private UnitRepository unitRepository;

    @InjectMocks private FloorService floorService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAllByBuilding_Success() {
        Floor f = new Floor();
        f.setId(10L);
        f.setBuildingId(1L);
        f.setCode("FL-1");

        when(floorRepository.findByBuildingId(1L)).thenReturn(List.of(f));

        List<Floor> result = floorService.findAllByBuilding(1L);
        assertEquals(1, result.size());
        assertEquals("FL-1", result.get(0).getCode());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(floorRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(FloorNotFoundException.class, () -> floorService.findById(999L));
    }

    @Test
    void create_BuildingHospitalMismatch_ThrowsInvalidHierarchyException() {
        FloorRequest req = new FloorRequest();
        req.setBuildingId(1L);
        req.setHospitalId(102L); // mismatch!
        req.setCode("FL-1");

        Building b = new Building();
        b.setId(1L);
        b.setHospitalId(101L); // actual hospital

        when(buildingRepository.findById(1L)).thenReturn(Optional.of(b));

        assertThrows(InvalidHierarchyException.class, () -> floorService.create(req));
    }

    @Test
    void delete_WithUnits_ThrowsInvalidHierarchyException() {
        Floor f = new Floor();
        f.setId(10L);
        when(floorRepository.findById(10L)).thenReturn(Optional.of(f));
        when(unitRepository.findByFloorId(10L)).thenReturn(List.of(new Unit()));

        assertThrows(InvalidHierarchyException.class, () -> floorService.delete(10L));
        verify(floorRepository, never()).delete(any());
    }
}
