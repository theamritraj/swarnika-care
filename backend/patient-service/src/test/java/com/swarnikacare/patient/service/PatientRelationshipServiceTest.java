package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientRelationshipRequest;
import com.swarnikacare.patient.dto.PatientRelationshipResponse;
import com.swarnikacare.patient.entity.Gender;
import com.swarnikacare.patient.entity.Patient;
import com.swarnikacare.patient.entity.PatientRelationship;
import com.swarnikacare.patient.entity.RelationshipType;
import com.swarnikacare.patient.exception.DuplicateResourceException;
import com.swarnikacare.patient.exception.InvalidRequestException;
import com.swarnikacare.patient.exception.PatientNotFoundException;
import com.swarnikacare.patient.repository.PatientRelationshipRepository;
import com.swarnikacare.patient.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientRelationshipServiceTest {

    @Mock
    private PatientRelationshipRepository relationshipRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientRelationshipServiceImpl relationshipService;

    private Patient mother;
    private Patient baby;
    private Patient baby2;

    @BeforeEach
    void setUp() {
        mother = new Patient();
        mother.setId(101L);
        mother.setFirstName("Jane");
        mother.setLastName("Doe");
        mother.setMrn("MRN-101000");
        mother.setGender(Gender.FEMALE);

        baby = new Patient();
        baby.setId(201L);
        baby.setFirstName("Baby1");
        baby.setLastName("Doe");
        baby.setMrn("MRN-201000");

        baby2 = new Patient();
        baby2.setId(202L);
        baby2.setFirstName("Baby2");
        baby2.setLastName("Doe");
        baby2.setMrn("MRN-202000");
    }

    @Test
    void addRelationship_MotherToBaby_Success() {
        PatientRelationshipRequest request = new PatientRelationshipRequest(201L, RelationshipType.MOTHER_OF, "Biological mother");
        
        when(patientRepository.findById(101L)).thenReturn(Optional.of(mother));
        when(patientRepository.findById(201L)).thenReturn(Optional.of(baby));
        when(relationshipRepository.existsBySourcePatientIdAndTargetPatientIdAndRelationshipType(101L, 201L, RelationshipType.MOTHER_OF))
                .thenReturn(false);

        PatientRelationship saved = new PatientRelationship();
        saved.setId(1L);
        saved.setSourcePatientId(101L);
        saved.setTargetPatientId(201L);
        saved.setRelationshipType(RelationshipType.MOTHER_OF);
        saved.setNotes("Biological mother");
        when(relationshipRepository.save(any(PatientRelationship.class))).thenReturn(saved);

        PatientRelationshipResponse response = relationshipService.addRelationship(101L, request);

        assertNotNull(response);
        assertEquals(101L, response.getSourcePatientId());
        assertEquals(201L, response.getTargetPatientId());
        assertEquals(RelationshipType.MOTHER_OF, response.getRelationshipType());
        assertEquals("Baby1", response.getTargetPatientFirstName());
        assertEquals("MRN-201000", response.getTargetPatientMrn());
    }

    @Test
    void addRelationship_MotherToTwins_Success() {
        // Mother to first baby
        when(patientRepository.findById(101L)).thenReturn(Optional.of(mother));
        when(patientRepository.findById(202L)).thenReturn(Optional.of(baby2));
        when(relationshipRepository.existsBySourcePatientIdAndTargetPatientIdAndRelationshipType(101L, 202L, RelationshipType.MOTHER_OF))
                .thenReturn(false);

        PatientRelationship saved = new PatientRelationship();
        saved.setId(2L);
        saved.setSourcePatientId(101L);
        saved.setTargetPatientId(202L);
        saved.setRelationshipType(RelationshipType.MOTHER_OF);
        saved.setNotes("Twin 2");
        when(relationshipRepository.save(any(PatientRelationship.class))).thenReturn(saved);

        PatientRelationshipRequest request = new PatientRelationshipRequest(202L, RelationshipType.MOTHER_OF, "Twin 2");
        PatientRelationshipResponse response = relationshipService.addRelationship(101L, request);

        assertNotNull(response);
        assertEquals(202L, response.getTargetPatientId());
        assertEquals("Baby2", response.getTargetPatientFirstName());
    }

    @Test
    void addRelationship_SelfRelationship_ThrowsException() {
        PatientRelationshipRequest request = new PatientRelationshipRequest(101L, RelationshipType.SPOUSE_OF, "Self");

        InvalidRequestException ex = assertThrows(InvalidRequestException.class,
                () -> relationshipService.addRelationship(101L, request));
        assertTrue(ex.getMessage().contains("Self-relationship is not permitted"));
        verify(relationshipRepository, never()).save(any());
    }

    @Test
    void addRelationship_Duplicate_ThrowsConflict() {
        PatientRelationshipRequest request = new PatientRelationshipRequest(201L, RelationshipType.MOTHER_OF, "Duplicate");

        when(patientRepository.findById(101L)).thenReturn(Optional.of(mother));
        when(patientRepository.findById(201L)).thenReturn(Optional.of(baby));
        when(relationshipRepository.existsBySourcePatientIdAndTargetPatientIdAndRelationshipType(101L, 201L, RelationshipType.MOTHER_OF))
                .thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> relationshipService.addRelationship(101L, request));
        verify(relationshipRepository, never()).save(any());
    }

    @Test
    void addRelationship_TargetPatientNotFound_ThrowsException() {
        PatientRelationshipRequest request = new PatientRelationshipRequest(999L, RelationshipType.MOTHER_OF, null);

        when(patientRepository.findById(101L)).thenReturn(Optional.of(mother));
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PatientNotFoundException.class, () -> relationshipService.addRelationship(101L, request));
        verify(relationshipRepository, never()).save(any());
    }

    @Test
    void getRelationshipsForPatient_ReturnsRelationships() {
        PatientRelationship rel = new PatientRelationship();
        rel.setId(1L);
        rel.setSourcePatientId(101L);
        rel.setTargetPatientId(201L);
        rel.setRelationshipType(RelationshipType.MOTHER_OF);

        when(patientRepository.existsById(101L)).thenReturn(true);
        when(relationshipRepository.findAllByPatientId(101L)).thenReturn(List.of(rel));
        when(patientRepository.findById(201L)).thenReturn(Optional.of(baby));

        List<PatientRelationshipResponse> results = relationshipService.getRelationshipsForPatient(101L);

        assertEquals(1, results.size());
        assertEquals(RelationshipType.MOTHER_OF, results.get(0).getRelationshipType());
        assertEquals("Baby1", results.get(0).getTargetPatientFirstName());
    }
}
