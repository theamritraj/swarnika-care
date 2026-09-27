package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.QueueTokenRequest;
import com.swarnikacare.encounter.dto.QueueTokenResponse;
import com.swarnikacare.encounter.entity.TokenStatus;

import java.time.LocalDate;
import java.util.List;

public interface QueueTokenService {
    QueueTokenResponse issueToken(QueueTokenRequest request);
    List<QueueTokenResponse> getTokens(Long hospitalId, Long doctorId, LocalDate queueDate, TokenStatus status);
    QueueTokenResponse getTokenById(Long id);
    QueueTokenResponse updateTokenStatus(Long id, TokenStatus status);
}
