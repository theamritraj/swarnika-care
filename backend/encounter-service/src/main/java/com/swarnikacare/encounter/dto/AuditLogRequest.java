package com.swarnikacare.encounter.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class AuditLogRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    private String actorUserId;
    private String actorRole;

    @NotNull(message = "Action is required")
    private String action;

    @NotNull(message = "Entity type is required")
    private String entityType;

    @NotNull(message = "Entity ID is required")
    private String entityId;

    private String details;

}
