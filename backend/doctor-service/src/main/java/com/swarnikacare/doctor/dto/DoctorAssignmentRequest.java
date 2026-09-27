package com.swarnikacare.doctor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DoctorAssignmentRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private String designation;
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    private Boolean publicAppointmentEnabled = false;
    private Boolean inHouseClinicalEnabled = true;

    public DoctorAssignmentRequest(Long hospitalId, Long departmentId, String designation, String status, Boolean publicAppointmentEnabled, Boolean inHouseClinicalEnabled) {
        this.hospitalId = hospitalId;
        this.departmentId = departmentId;
        this.designation = designation;
        this.status = status != null ? status : "ACTIVE";
        this.publicAppointmentEnabled = publicAppointmentEnabled != null ? publicAppointmentEnabled : false;
        this.inHouseClinicalEnabled = inHouseClinicalEnabled != null ? inHouseClinicalEnabled : true;
    }

}
