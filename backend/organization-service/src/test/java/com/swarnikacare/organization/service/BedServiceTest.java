package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.BedRequest;
import com.swarnikacare.organization.entity.Bed;
import com.swarnikacare.organization.entity.Room;
import com.swarnikacare.organization.enums.BedStatus;
import com.swarnikacare.organization.enums.BedType;
import com.swarnikacare.organization.exception.BedNotFoundException;
import com.swarnikacare.organization.exception.DuplicateResourceException;
import com.swarnikacare.organization.repository.BedRepository;
import com.swarnikacare.organization.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BedServiceTest {

    @Mock private BedRepository bedRepository;
    @Mock private RoomRepository roomRepository;

    @InjectMocks private BedService bedService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAllByRoom_Success() {
        Bed b = new Bed();
        b.setId(40L);
        b.setRoomId(30L);
        b.setBedNumber("BED-01");
        b.setStatus(BedStatus.AVAILABLE);

        when(bedRepository.findByRoomId(30L)).thenReturn(List.of(b));

        List<Bed> result = bedService.findAllByRoom(30L);
        assertEquals(1, result.size());
        assertEquals("BED-01", result.get(0).getBedNumber());
        assertEquals(BedStatus.AVAILABLE, result.get(0).getStatus());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(bedRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(BedNotFoundException.class, () -> bedService.findById(999L));
    }

    @Test
    void updateStatus_Success() {
        Bed b = new Bed();
        b.setId(40L);
        b.setStatus(BedStatus.AVAILABLE);

        when(bedRepository.findById(40L)).thenReturn(Optional.of(b));
        when(bedRepository.save(any(Bed.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bed updated = bedService.updateStatus(40L, Map.of("status", "MAINTENANCE"));
        assertNotNull(updated);
        assertEquals(BedStatus.MAINTENANCE, updated.getStatus());
    }

    @Test
    void create_DuplicateBedNumber_ThrowsDuplicateResourceException() {
        BedRequest req = new BedRequest();
        req.setRoomId(30L);
        req.setBedNumber("BED-01");
        req.setBedType(BedType.GENERAL);

        Room r = new Room();
        r.setId(30L);
        when(roomRepository.findById(30L)).thenReturn(Optional.of(r));
        when(bedRepository.findByRoomIdAndBedNumber(30L, "BED-01")).thenReturn(Optional.of(new Bed()));

        assertThrows(DuplicateResourceException.class, () -> bedService.create(req));
    }
}
