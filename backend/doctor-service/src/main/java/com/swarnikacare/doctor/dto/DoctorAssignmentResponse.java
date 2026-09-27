package com.swarnikacare.doctor.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorAssignmentResponse {

    private Long id;
    private Long doctorId;
    private Long hospitalId;
    private Long departmentId;
    private String designation;
    private String status;
    private Boolean publicAppointmentEnabled;
    private Boolean inHouseClinicalEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
