package com.swarnikacare.organization.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "positions", uniqueConstraints = {@UniqueConstraint(columnNames = {"hospital_id", "code"})})
@Getter
@Setter
@NoArgsConstructor
public class Position {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, name = "hospital_id")
    private Long hospitalId;
    @Column(nullable = false)
    private Long departmentId;
    @Column(nullable = false)
    private Long designationId;
    @Column(nullable = false)
    private String code;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private Long reportsToPositionId;
    @Column(nullable = false)
    private String status;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
