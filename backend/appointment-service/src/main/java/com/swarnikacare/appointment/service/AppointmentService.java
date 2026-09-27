package com.swarnikacare.appointment.service;

import com.swarnikacare.appointment.dto.AppointmentCreateRequest;
import com.swarnikacare.appointment.dto.AppointmentResponse;
import com.swarnikacare.appointment.dto.AppointmentUpdateRequest;
import com.swarnikacare.appointment.dto.AppointmentCancelRequest;
import com.swarnikacare.appointment.dto.AppointmentRescheduleRequest;

import java.util.List;

public interface AppointmentService {

    List<AppointmentResponse> getAllAppointments();

    AppointmentResponse createAppointment(AppointmentCreateRequest request);

    AppointmentResponse getAppointmentById(Long id);

    List<AppointmentResponse> getAppointmentsByPatient(Long patientId);

    List<AppointmentResponse> getAppointmentsByDoctor(Long doctorId);

    AppointmentResponse updateAppointment(Long id, AppointmentUpdateRequest request);

    AppointmentResponse cancelAppointment(Long id, AppointmentCancelRequest request);

    AppointmentResponse completeAppointment(Long id);
    AppointmentResponse confirmAppointment(Long id);
    AppointmentResponse noShowAppointment(Long id);
    
    AppointmentResponse rescheduleAppointment(Long id, AppointmentRescheduleRequest request);
}
