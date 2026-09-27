package com.swarnikacare.doctor.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorAvailabilityResponse {
    private Long id;
    private Long doctorId;
    private Long hospitalId;
    private Long departmentId;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isActive;

}
