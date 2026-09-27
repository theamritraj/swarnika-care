package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ReferralPriority;
import com.swarnikacare.encounter.entity.ReferralStatus;
import com.swarnikacare.encounter.entity.ReferralType;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class ReferralResponse {
    private Long id;
    private String referralNumber;
    private Long patientId;
    private Long hospitalId;
    private Long referringDoctorId;
    private Long fromDepartmentId;
    private Long targetHospitalId;
    private Long targetDepartmentId;
    private Long targetDoctorId;
    private ReferralType referralType;
    private ReferralPriority priority;
    private ReferralStatus status;
    private String reason;
    private String clinicalNotes;
    private Long appointmentId;
    private String administrativeNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
