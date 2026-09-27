package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.DesignationRequest;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.repository.DesignationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DesignationServiceTest {

    @Mock
    private DesignationRepository repository;

    @InjectMocks
    private DesignationService service;

    @Test
    void create_Success() {
        DesignationRequest req = new DesignationRequest();
        req.setCode("SENIOR_CONSULTANT");
        req.setName("Senior Consultant");

        Designation mockSaved = new Designation();
        mockSaved.setId(1L);
        mockSaved.setCode("SENIOR_CONSULTANT");
        mockSaved.setActive(true);

        when(repository.findByCode("SENIOR_CONSULTANT")).thenReturn(Optional.empty());
        when(repository.save(any(Designation.class))).thenReturn(mockSaved);

        Designation result = service.create(req);

        assertNotNull(result);
        assertEquals("SENIOR_CONSULTANT", result.getCode());
        assertTrue(result.getActive());
    }

    @Test
    void create_DuplicateCode_ThrowsException() {
        DesignationRequest req = new DesignationRequest();
        req.setCode("SENIOR_CONSULTANT");

        when(repository.findByCode("SENIOR_CONSULTANT")).thenReturn(Optional.of(new Designation()));

        assertThrows(RuntimeException.class, () -> service.create(req));
    }
}
