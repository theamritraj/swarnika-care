package com.swarnikacare.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class AppointmentCancelRequest {

    @NotNull(message = "Cancellation reason is required")
    private String reason;

}
