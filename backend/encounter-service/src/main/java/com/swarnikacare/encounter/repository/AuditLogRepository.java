package com.swarnikacare.encounter.repository;

import com.swarnikacare.encounter.entity.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByHospitalIdOrderByTimestampDesc(Long hospitalId, Pageable pageable);
    List<AuditLog> findByHospitalIdAndEntityTypeOrderByTimestampDesc(Long hospitalId, String entityType, Pageable pageable);
    List<AuditLog> findByHospitalIdAndActorUserIdOrderByTimestampDesc(Long hospitalId, String actorUserId, Pageable pageable);
}
