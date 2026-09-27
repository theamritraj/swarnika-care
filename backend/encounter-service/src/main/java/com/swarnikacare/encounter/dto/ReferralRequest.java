package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ReferralPriority;
import com.swarnikacare.encounter.entity.ReferralType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class ReferralRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Origin Hospital ID is required")
    private Long hospitalId;

    private Long referringDoctorId;
    private Long fromDepartmentId;

    @NotNull(message = "Target Hospital ID is required")
    private Long targetHospitalId;

    @NotNull(message = "Target Department ID is required")
    private Long targetDepartmentId;

    private Long targetDoctorId;

    private ReferralType referralType = ReferralType.INTERNAL;
    private ReferralPriority priority = ReferralPriority.ROUTINE;

    @NotNull(message = "Referral reason is required")
    private String reason;

    private String clinicalNotes;
    private String administrativeNotes;

}
