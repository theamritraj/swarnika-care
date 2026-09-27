package com.swarnikacare.encounter.repository;

import com.swarnikacare.encounter.entity.Referral;
import com.swarnikacare.encounter.entity.ReferralStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {
    Optional<Referral> findByReferralNumber(String referralNumber);
    List<Referral> findByHospitalIdOrTargetHospitalId(Long hospitalId, Long targetHospitalId);
    List<Referral> findByTargetHospitalId(Long targetHospitalId);
    List<Referral> findByPatientId(Long patientId);
    List<Referral> findByTargetHospitalIdAndStatus(Long targetHospitalId, ReferralStatus status);
}
