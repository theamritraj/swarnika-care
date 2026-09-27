package com.swarnikacare.patient.repository;

import com.swarnikacare.patient.entity.PatientRelationship;
import com.swarnikacare.patient.entity.RelationshipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRelationshipRepository extends JpaRepository<PatientRelationship, Long> {
    List<PatientRelationship> findBySourcePatientId(Long sourcePatientId);
    List<PatientRelationship> findByTargetPatientId(Long targetPatientId);

    @Query("SELECT r FROM PatientRelationship r WHERE r.sourcePatientId = :patientId OR r.targetPatientId = :patientId")
    List<PatientRelationship> findAllByPatientId(@Param("patientId") Long patientId);

    Optional<PatientRelationship> findBySourcePatientIdAndTargetPatientIdAndRelationshipType(
            Long sourcePatientId, Long targetPatientId, RelationshipType relationshipType);

    boolean existsBySourcePatientIdAndTargetPatientIdAndRelationshipType(
            Long sourcePatientId, Long targetPatientId, RelationshipType relationshipType);
}
