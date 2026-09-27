package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.QueueTokenRequest;
import com.swarnikacare.encounter.dto.QueueTokenResponse;
import com.swarnikacare.encounter.entity.QueueToken;
import com.swarnikacare.encounter.entity.TokenPriority;
import com.swarnikacare.encounter.entity.TokenStatus;
import com.swarnikacare.encounter.exception.ResourceNotFoundException;
import com.swarnikacare.encounter.repository.QueueTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QueueTokenServiceImpl implements QueueTokenService {

    private final QueueTokenRepository queueTokenRepository;

    public QueueTokenServiceImpl(QueueTokenRepository queueTokenRepository) {
        this.queueTokenRepository = queueTokenRepository;
    }

    @Override
    @Transactional
    public synchronized QueueTokenResponse issueToken(QueueTokenRequest request) {
        LocalDate date = request.getQueueDate() != null ? request.getQueueDate() : LocalDate.now();

        // Check if token already issued for this appointment
        if (request.getAppointmentId() != null) {
            Optional<QueueToken> existing = queueTokenRepository.findByAppointmentId(request.getAppointmentId());
            if (existing.isPresent()) {
                return mapToResponse(existing.get());
            }
        } else if (request.getPatientId() != null && request.getDoctorId() != null) {
            List<QueueToken> activeTokens = queueTokenRepository.findByHospitalIdAndDoctorIdAndQueueDate(request.getHospitalId(), request.getDoctorId(), date);
            Optional<QueueToken> existingActive = activeTokens.stream()
                    .filter(t -> t.getPatientId().equals(request.getPatientId()) &&
                            (t.getStatus() == TokenStatus.WAITING || t.getStatus() == TokenStatus.CALLED || t.getStatus() == TokenStatus.IN_SERVICE))
                    .findFirst();
            if (existingActive.isPresent()) {
                return mapToResponse(existingActive.get());
            }
        }

        Optional<Integer> maxSeq = queueTokenRepository.findMaxSequenceForUpdate(request.getHospitalId(), date);
        int nextSeq = maxSeq.map(s -> s + 1).orElse(1);

        String prefix = (request.getPriority() == TokenPriority.EMERGENCY) ? "E-" :
                        (request.getPriority() == TokenPriority.URGENT) ? "U-" : "T-";
        String tokenNumber = prefix + String.format("%03d", nextSeq);

        QueueToken token = new QueueToken();
        token.setTokenNumber(tokenNumber);
        token.setSequenceNumber(nextSeq);
        token.setHospitalId(request.getHospitalId());
        token.setDepartmentId(request.getDepartmentId());
        token.setDoctorId(request.getDoctorId());
        token.setPatientId(request.getPatientId());
        token.setAppointmentId(request.getAppointmentId());
        token.setEncounterId(request.getEncounterId());
        token.setQueueDate(date);
        token.setStatus(TokenStatus.WAITING);
        token.setPriority(request.getPriority() != null ? request.getPriority() : TokenPriority.NORMAL);

        QueueToken saved = queueTokenRepository.save(token);
        return mapToResponse(saved);
    }

    @Override
    public List<QueueTokenResponse> getTokens(Long hospitalId, Long doctorId, LocalDate queueDate, TokenStatus status) {
        LocalDate date = queueDate != null ? queueDate : LocalDate.now();
        List<QueueToken> list;
        if (doctorId != null && status != null) {
            list = queueTokenRepository.findByHospitalIdAndDoctorIdAndQueueDateAndStatus(hospitalId, doctorId, date, status);
        } else if (doctorId != null) {
            list = queueTokenRepository.findByHospitalIdAndDoctorIdAndQueueDate(hospitalId, doctorId, date);
        } else if (status != null) {
            list = queueTokenRepository.findByHospitalIdAndQueueDateAndStatus(hospitalId, date, status);
        } else {
            list = queueTokenRepository.findByHospitalIdAndQueueDate(hospitalId, date);
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public QueueTokenResponse getTokenById(Long id) {
        QueueToken token = queueTokenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue token not found with id: " + id));
        return mapToResponse(token);
    }

    @Override
    @Transactional
    public QueueTokenResponse updateTokenStatus(Long id, TokenStatus status) {
        QueueToken token = queueTokenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue token not found with id: " + id));

        token.setStatus(status);
        if (status == TokenStatus.CALLED) {
            token.setCalledAt(LocalDateTime.now());
        } else if (status == TokenStatus.COMPLETED) {
            token.setCompletedAt(LocalDateTime.now());
        }

        QueueToken updated = queueTokenRepository.save(token);
        return mapToResponse(updated);
    }

    private QueueTokenResponse mapToResponse(QueueToken t) {
        QueueTokenResponse r = new QueueTokenResponse();
        r.setId(t.getId());
        r.setTokenNumber(t.getTokenNumber());
        r.setSequenceNumber(t.getSequenceNumber());
        r.setHospitalId(t.getHospitalId());
        r.setDepartmentId(t.getDepartmentId());
        r.setDoctorId(t.getDoctorId());
        r.setPatientId(t.getPatientId());
        r.setAppointmentId(t.getAppointmentId());
        r.setEncounterId(t.getEncounterId());
        r.setQueueDate(t.getQueueDate());
        r.setStatus(t.getStatus());
        r.setPriority(t.getPriority());
        r.setCalledAt(t.getCalledAt());
        r.setCompletedAt(t.getCompletedAt());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }
}
