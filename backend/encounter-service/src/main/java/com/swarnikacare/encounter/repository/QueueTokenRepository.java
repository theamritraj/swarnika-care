package com.swarnikacare.encounter.repository;

import com.swarnikacare.encounter.entity.QueueToken;
import com.swarnikacare.encounter.entity.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {
    Optional<QueueToken> findTopByHospitalIdAndQueueDateOrderBySequenceNumberDesc(Long hospitalId, LocalDate queueDate);

    @Query(value = "SELECT sequence_number FROM queue_tokens WHERE hospital_id = :hospitalId AND queue_date = :queueDate ORDER BY sequence_number DESC LIMIT 1 FOR UPDATE", nativeQuery = true)
    Optional<Integer> findMaxSequenceForUpdate(@Param("hospitalId") Long hospitalId, @Param("queueDate") LocalDate queueDate);
    List<QueueToken> findByHospitalIdAndQueueDate(Long hospitalId, LocalDate queueDate);
    List<QueueToken> findByHospitalIdAndDoctorIdAndQueueDate(Long hospitalId, Long doctorId, LocalDate queueDate);
    List<QueueToken> findByHospitalIdAndDoctorIdAndQueueDateAndStatus(Long hospitalId, Long doctorId, LocalDate queueDate, TokenStatus status);
    List<QueueToken> findByHospitalIdAndQueueDateAndStatus(Long hospitalId, LocalDate queueDate, TokenStatus status);
    List<QueueToken> findByPatientId(Long patientId);
    Optional<QueueToken> findByAppointmentId(Long appointmentId);
    Optional<QueueToken> findByEncounterId(Long encounterId);
}
