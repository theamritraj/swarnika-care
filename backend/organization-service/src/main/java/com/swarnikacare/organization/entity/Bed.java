package com.swarnikacare.organization.entity;

import com.swarnikacare.organization.enums.BedType;
import com.swarnikacare.organization.enums.BedStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import java.sql.Types;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "beds")
@Getter
@Setter
@NoArgsConstructor
public class Bed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "building_id", nullable = false)
    private Long buildingId;

    @Column(name = "floor_id", nullable = false)
    private Long floorId;

    @Column(name = "unit_id", nullable = false)
    private Long unitId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "bed_number", nullable = false, length = 50)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(Types.VARCHAR)
    @Column(name = "bed_type", nullable = false, length = 50)
    private BedType bedType;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(Types.VARCHAR)
    @Column(length = 50)
    private BedStatus status = BedStatus.AVAILABLE;

    @Column(name = "gender_restriction", length = 50)
    private String genderRestriction;

    @Column(name = "is_isolation")
    private Boolean isIsolation = false;

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
