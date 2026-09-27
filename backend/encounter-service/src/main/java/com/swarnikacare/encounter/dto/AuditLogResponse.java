package com.swarnikacare.encounter.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class AuditLogResponse {
    private Long id;
    private Long hospitalId;
    private String actorUserId;
    private String actorRole;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private LocalDateTime timestamp;

}
