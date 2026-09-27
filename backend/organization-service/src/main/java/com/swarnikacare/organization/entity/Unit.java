package com.swarnikacare.organization.entity;

import com.swarnikacare.organization.enums.UnitType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import java.sql.Types;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "units")
@Getter
@Setter
@NoArgsConstructor
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "building_id", nullable = false)
    private Long buildingId;

    @Column(name = "floor_id", nullable = false)
    private Long floorId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(Types.VARCHAR)
    @Column(nullable = false, length = 50)
    private UnitType type;

    private String description;
    
    private Integer capacity = 0;

    @Column(name = "gender_restriction", length = 50)
    private String genderRestriction;

    @Column(name = "age_group", length = 50)
    private String ageGroup;

    @Column(length = 50)
    private String status = "ACTIVE";

    @Column(name = "public_visibility")
    private Boolean publicVisibility = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
