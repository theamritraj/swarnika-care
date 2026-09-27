package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_al_hospital_time", columnList = "hospital_id, timestamp"),
        @Index(name = "idx_al_actor", columnList = "actor_user_id"),
        @Index(name = "idx_al_action", columnList = "action")
})
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "actor_user_id", nullable = false, length = 100)
    private String actorUserId;

    @Column(name = "actor_role", nullable = false, length = 50)
    private String actorRole;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

}
