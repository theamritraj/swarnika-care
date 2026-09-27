package com.swarnikacare.doctor.entity;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "doctor_availability")
@Getter
@Setter
@NoArgsConstructor
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long hospitalId; // To support multi-hospital availability

    @Column(nullable = false)
    private Long departmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Boolean isActive = true;

}
