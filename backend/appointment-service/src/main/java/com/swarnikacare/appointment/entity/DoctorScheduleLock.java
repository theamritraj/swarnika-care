package com.swarnikacare.appointment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "doctor_schedule_locks")
@Getter
@Setter
@NoArgsConstructor
public class DoctorScheduleLock {

    @Id
    private Long doctorId;

    private LocalDateTime lastUpdated;

    public DoctorScheduleLock(Long doctorId) {
        this.doctorId = doctorId;
        this.lastUpdated = LocalDateTime.now();
    }

}
