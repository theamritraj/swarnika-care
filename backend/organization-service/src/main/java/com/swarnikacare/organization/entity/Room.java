package com.swarnikacare.organization.entity;

import com.swarnikacare.organization.enums.RoomType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import java.sql.Types;
import java.time.LocalDateTime;
import com.swarnikacare.organization.enums.RoomStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
public class Room {
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

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column(name = "room_name", length = 255)
    private String roomName;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(Types.VARCHAR)
    @Column(name = "room_type", nullable = false, length = 50)
    private RoomType roomType;

    private Integer capacity = 1;

    @Column(name = "gender_restriction", length = 50)
    private String genderRestriction;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(Types.VARCHAR)
    @Column(length = 50)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @org.hibernate.annotations.Formula("(SELECT count(*) FROM beds b WHERE b.room_id = id)")
    private Integer bedCount;

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
