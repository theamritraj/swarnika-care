package com.swarnikacare.encounter.repository;

import com.swarnikacare.encounter.entity.Encounter;
import com.swarnikacare.encounter.entity.EncounterStatus;
import com.swarnikacare.encounter.entity.EncounterType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, Long> {
    Optional<Encounter> findByEncounterNumber(String encounterNumber);
    List<Encounter> findByPatientId(Long patientId);
    List<Encounter> findByHospitalId(Long hospitalId);
    List<Encounter> findByDoctorId(Long doctorId);
    List<Encounter> findByAppointmentId(Long appointmentId);
    List<Encounter> findByPatientIdAndStatus(Long patientId, EncounterStatus status);
    List<Encounter> findByHospitalIdAndEncounterType(Long hospitalId, EncounterType encounterType);
    boolean existsByEncounterNumber(String encounterNumber);
    boolean existsByAppointmentId(Long appointmentId);
}
