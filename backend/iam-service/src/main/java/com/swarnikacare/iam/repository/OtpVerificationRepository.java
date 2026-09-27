package com.swarnikacare.iam.repository;

import com.swarnikacare.iam.entity.OtpPurpose;
import com.swarnikacare.iam.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(String email, OtpPurpose purpose);
}
