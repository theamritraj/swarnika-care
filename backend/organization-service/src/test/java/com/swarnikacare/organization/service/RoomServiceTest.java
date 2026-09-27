package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.RoomRequest;
import com.swarnikacare.organization.entity.Room;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.exception.InvalidHierarchyException;
import com.swarnikacare.organization.exception.RoomNotFoundException;
import com.swarnikacare.organization.repository.BedRepository;
import com.swarnikacare.organization.repository.RoomRepository;
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

class RoomServiceTest {

    @Mock private RoomRepository roomRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private BedRepository bedRepository;

    @InjectMocks private RoomService roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAllByUnit_Success() {
        Room r = new Room();
        r.setId(30L);
        r.setUnitId(20L);
        r.setRoomNumber("101-A");

        when(roomRepository.findByUnitId(20L)).thenReturn(List.of(r));

        List<Room> result = roomService.findAllByUnit(20L);
        assertEquals(1, result.size());
        assertEquals("101-A", result.get(0).getRoomNumber());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RoomNotFoundException.class, () -> roomService.findById(999L));
    }

    @Test
    void create_UnitHierarchyMismatch_ThrowsInvalidHierarchyException() {
        RoomRequest req = new RoomRequest();
        req.setHospitalId(101L);
        req.setBuildingId(1L);
        req.setFloorId(99L); // mismatch!
        req.setUnitId(20L);
        req.setRoomNumber("101");

        Unit u = new Unit();
        u.setId(20L);
        u.setHospitalId(101L);
        u.setBuildingId(1L);
        u.setFloorId(10L); // actual floor

        when(unitRepository.findById(20L)).thenReturn(Optional.of(u));

        assertThrows(InvalidHierarchyException.class, () -> roomService.create(req));
    }
}
