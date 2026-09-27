package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.TokenPriority;
import com.swarnikacare.encounter.entity.TokenStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class QueueTokenResponse {
    private Long id;
    private String tokenNumber;
    private Integer sequenceNumber;
    private Long hospitalId;
    private Long departmentId;
    private Long doctorId;
    private Long patientId;
    private Long appointmentId;
    private Long encounterId;
    private LocalDate queueDate;
    private TokenStatus status;
    private TokenPriority priority;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
