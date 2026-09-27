package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.TokenPriority;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class QueueTokenRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long appointmentId;
    private Long encounterId;
    private LocalDate queueDate;
    private TokenPriority priority = TokenPriority.NORMAL;

}
