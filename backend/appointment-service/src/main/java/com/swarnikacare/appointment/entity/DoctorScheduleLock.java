package com.swarnikacare.appointment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_schedule_locks")
public class DoctorScheduleLock {

    @Id
    private Long doctorId;

    private LocalDateTime lastUpdated;

    public DoctorScheduleLock() {}

    public DoctorScheduleLock(Long doctorId) {
        this.doctorId = doctorId;
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
