import os

service_interface = "backend/appointment-service/src/main/java/com/swarnikacare/appointment/service/AppointmentService.java"
with open(service_interface, "r") as f:
    content = f.read()

if "confirmAppointment" not in content:
    content = content.replace(
        "AppointmentResponse completeAppointment(Long id);",
        "AppointmentResponse completeAppointment(Long id);\n    AppointmentResponse confirmAppointment(Long id);\n    AppointmentResponse noShowAppointment(Long id);"
    )
    with open(service_interface, "w") as f:
        f.write(content)

service_impl = "backend/appointment-service/src/main/java/com/swarnikacare/appointment/service/AppointmentServiceImpl.java"
with open(service_impl, "r") as f:
    content = f.read()

if "confirmAppointment" not in content:
    new_methods = """
    @Override
    @Transactional
    public AppointmentResponse confirmAppointment(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentAction(appointment);

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new InvalidAppointmentTimeException("Only SCHEDULED appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment saved = appointmentRepository.save(appointment);
        
        publishAppointmentEvent(saved, null, null, null, "swarnika.appointment.confirmed", "AppointmentConfirmedEvent");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse noShowAppointment(Long id) {
        Appointment appointment = findByIdOrThrow(id);
        authorizeAppointmentAction(appointment);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new InvalidAppointmentTimeException("Only SCHEDULED or CONFIRMED appointments can be marked as no-show");
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        Appointment saved = appointmentRepository.save(appointment);
        
        publishAppointmentEvent(saved, null, null, null, "swarnika.appointment.noshow", "AppointmentNoShowEvent");
        return mapToResponse(saved);
    }
"""
    content = content.replace(
        "public AppointmentResponse rescheduleAppointment(Long id, AppointmentRescheduleRequest request) {",
        new_methods + "\n    @Override\n    @Transactional\n    public AppointmentResponse rescheduleAppointment(Long id, AppointmentRescheduleRequest request) {"
    )
    with open(service_impl, "w") as f:
        f.write(content)

controller = "backend/appointment-service/src/main/java/com/swarnikacare/appointment/controller/AppointmentController.java"
with open(controller, "r") as f:
    content = f.read()

if "confirmAppointment" not in content:
    new_methods = """
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirmAppointment(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(createSuccessResponse("Appointment confirmed successfully", appointment));
    }

    @PatchMapping("/{id}/no-show")
    public ResponseEntity<Map<String, Object>> noShowAppointment(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.noShowAppointment(id);
        return ResponseEntity.ok(createSuccessResponse("Appointment marked as no-show successfully", appointment));
    }
"""
    content = content.replace(
        "public ResponseEntity<Map<String, Object>> rescheduleAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRescheduleRequest request) {",
        new_methods + "\n    @PatchMapping(\"/{id}/reschedule\")\n    public ResponseEntity<Map<String, Object>> rescheduleAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRescheduleRequest request) {"
    )
    with open(controller, "w") as f:
        f.write(content)
