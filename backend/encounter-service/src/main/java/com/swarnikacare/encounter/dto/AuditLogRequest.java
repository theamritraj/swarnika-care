package com.swarnikacare.encounter.dto;

import jakarta.validation.constraints.NotNull;

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

    public AuditLogRequest() {}

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getActorUserId() { return actorUserId; }
    public void setActorUserId(String actorUserId) { this.actorUserId = actorUserId; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
