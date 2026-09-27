package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.ReferralRequest;
import com.swarnikacare.encounter.dto.ReferralResponse;
import com.swarnikacare.encounter.entity.ReferralStatus;

import java.util.List;

public interface ReferralService {
    ReferralResponse createReferral(ReferralRequest request);
    List<ReferralResponse> getReferrals(Long hospitalId, Long patientId, ReferralStatus status);
    ReferralResponse getReferralById(Long id);
    ReferralResponse updateReferralStatus(Long id, ReferralStatus status, Long appointmentId, String administrativeNotes);
}
