package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.AdmissionStatus;
import com.swarnikacare.encounter.entity.AdmissionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class AdmissionResponse {
    private Long id;
    private String admissionNumber;
    private Long patientId;
    private Long hospitalId;
    private Long departmentId;
    private Long admittingDoctorId;
    private LocalDate admissionDate;
    private LocalTime admissionTime;
    private AdmissionType admissionType;
    private AdmissionStatus status;
    private Long wardId;
    private Long roomId;
    private Long bedId;
    private String initiatingStaffUserId;
    private String reason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
