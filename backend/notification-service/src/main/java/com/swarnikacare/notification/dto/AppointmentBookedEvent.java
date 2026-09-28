package com.swarnikacare.notification.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentBookedEvent {
    private String eventId;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String appointmentDate;
    private String timeSlot;
    private String appointmentStatus;
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private String hospitalName;
    private String hospitalAddress;
}
