package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.BuildingRequest;
import com.swarnikacare.organization.entity.Building;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.exception.BuildingNotFoundException;
import com.swarnikacare.organization.exception.InvalidHierarchyException;
import com.swarnikacare.organization.repository.BuildingRepository;
import com.swarnikacare.organization.repository.FloorRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BuildingServiceTest {

    @Mock private BuildingRepository buildingRepository;
    @Mock private HospitalRepository hospitalRepository;
    @Mock private FloorRepository floorRepository;

    @InjectMocks private BuildingService buildingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAllByHospital_Success() {
        Building b1 = new Building();
        b1.setId(1L);
        b1.setHospitalId(101L);
        b1.setCode("BLD-1");

        when(buildingRepository.findByHospitalId(101L)).thenReturn(List.of(b1));

        List<Building> result = buildingService.findAllByHospital(101L);
        assertEquals(1, result.size());
        assertEquals("BLD-1", result.get(0).getCode());
    }

    @Test
    void findById_Success() {
        Building b = new Building();
        b.setId(1L);
        b.setHospitalId(101L);

        when(buildingRepository.findById(1L)).thenReturn(Optional.of(b));

        Building found = buildingService.findById(1L);
        assertNotNull(found);
        assertEquals(1L, found.getId());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(buildingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(BuildingNotFoundException.class, () -> buildingService.findById(99L));
    }

    @Test
    void delete_WithFloors_ThrowsInvalidHierarchyException() {
        Building b = new Building();
        b.setId(1L);
        when(buildingRepository.findById(1L)).thenReturn(Optional.of(b));
        when(floorRepository.findByBuildingId(1L)).thenReturn(List.of(new Floor()));

        assertThrows(InvalidHierarchyException.class, () -> buildingService.delete(1L));
        verify(buildingRepository, never()).delete(any());
    }
}
