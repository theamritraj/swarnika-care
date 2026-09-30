package com.swarnikacare.appointment.service;

import com.swarnikacare.appointment.entity.Appointment;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class AppointmentEmailService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentEmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:swarnikahospitals@gmail.com}")
    private String fromEmail;

    @Async
    public void sendBookingConfirmationEmail(
            Appointment appointment,
            String recipientEmail,
            String patientName,
            String doctorName,
            String hospitalName,
            String hospitalAddress
    ) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.info("No recipient email provided for appointment id {}. Skipping confirmation email.", appointment.getId());
            return;
        }

        if (mailSender == null) {
            log.warn("JavaMailSender bean is not configured. Skipping confirmation email to {}", recipientEmail);
            return;
        }

        String toEmail = recipientEmail.trim().toLowerCase();
        log.info("📧 Sending appointment booking confirmation email to {} for appointment {}", toEmail, appointment.getAppointmentNumber());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setFrom(fromEmail, "Swarnika Hospitals");
            helper.setSubject("Appointment Confirmed - " + appointment.getAppointmentNumber() + " | Swarnika Hospitals");

            String effectivePatientName = (patientName != null && !patientName.isBlank()) ? patientName : "Valued Patient";
            String effectiveDoctorName = (doctorName != null && !doctorName.isBlank()) ? doctorName : "Specialist Consultant";
            String effectiveHospitalName = (hospitalName != null && !hospitalName.isBlank()) ? hospitalName : "Swarnika Hospitals Main Branch";
            String effectiveHospitalAddress = (hospitalAddress != null && !hospitalAddress.isBlank()) ? hospitalAddress : "Healthcare City, Sasaram, Bihar";

            String formattedDate = appointment.getAppointmentDate() != null
                    ? appointment.getAppointmentDate().format(DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy"))
                    : "Scheduled Date";

            String timeSlot = "";
            if (appointment.getStartTime() != null) {
                timeSlot = appointment.getStartTime().toString();
                if (appointment.getEndTime() != null) {
                    timeSlot += " - " + appointment.getEndTime().toString();
                }
            } else {
                timeSlot = "Scheduled Slot";
            }

            String html = buildEmailHtml(
                    effectivePatientName,
                    appointment.getAppointmentNumber(),
                    formattedDate,
                    timeSlot,
                    effectiveDoctorName,
                    effectiveHospitalName,
                    effectiveHospitalAddress
            );

            helper.setText(html, true);
            mailSender.send(message);

            log.info("✅ Appointment confirmation email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send appointment confirmation email to {}", toEmail, e);
        }
    }

    private String buildEmailHtml(
            String patientName,
            String appointmentNumber,
            String appointmentDate,
            String timeSlot,
            String doctorName,
            String hospitalName,
            String hospitalAddress
    ) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<title>Appointment Confirmation</title>"
                + "</head>"
                + "<body style='font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f7f9; color: #1e293b;'>"
                + "<div style='max-width: 620px; margin: 24px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;'>"
                + "  <div style='background: linear-gradient(135deg, #007b92 0%, #004d5b 100%); color: #ffffff; padding: 32px 30px; text-align: left;'>"
                + "    <div style='font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; color: #a5f3fc; font-weight: 600;'>Swarnika Hospitals Care Network</div>"
                + "    <h1 style='font-size: 24px; font-weight: 700; margin: 0; color: #ffffff;'>Appointment Confirmed</h1>"
                + "  </div>"
                + "  <div style='padding: 30px;'>"
                + "    <div style='background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; margin-bottom: 24px; border-radius: 4px;'>"
                + "      <p style='font-weight: 700; margin: 0 0 6px 0; font-size: 15px; color: #166534;'>Dear " + escapeHtml(patientName) + ",</p>"
                + "      <p style='margin: 0; font-size: 14px; line-height: 1.5; color: #15803d;'>Your appointment has been successfully scheduled. Below are your consultation and registration details.</p>"
                + "    </div>"
                + "    <div style='font-size: 12px; color: #007b92; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;'>Consultation Summary</div>"
                + "    <table style='width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;'>"
                + "      <tr style='border-bottom: 1px solid #f1f5f9;'>"
                + "        <td style='padding: 12px 8px; width: 38%; color: #64748b; font-weight: 600;'>Appointment No:</td>"
                + "        <td style='padding: 12px 8px; font-weight: 700; color: #0f172a;'>" + escapeHtml(appointmentNumber) + "</td>"
                + "      </tr>"
                + "      <tr style='border-bottom: 1px solid #f1f5f9;'>"
                + "        <td style='padding: 12px 8px; color: #64748b; font-weight: 600;'>Doctor / Specialist:</td>"
                + "        <td style='padding: 12px 8px; font-weight: 700; color: #0f172a;'>" + escapeHtml(doctorName) + "</td>"
                + "      </tr>"
                + "      <tr style='border-bottom: 1px solid #f1f5f9;'>"
                + "        <td style='padding: 12px 8px; color: #64748b; font-weight: 600;'>Date:</td>"
                + "        <td style='padding: 12px 8px; font-weight: 700; color: #0f172a;'>" + escapeHtml(appointmentDate) + "</td>"
                + "      </tr>"
                + "      <tr style='border-bottom: 1px solid #f1f5f9;'>"
                + "        <td style='padding: 12px 8px; color: #64748b; font-weight: 600;'>Time Slot:</td>"
                + "        <td style='padding: 12px 8px; font-weight: 700; color: #007b92;'>" + escapeHtml(timeSlot) + "</td>"
                + "      </tr>"
                + "      <tr style='border-bottom: 1px solid #f1f5f9;'>"
                + "        <td style='padding: 12px 8px; color: #64748b; font-weight: 600;'>Hospital:</td>"
                + "        <td style='padding: 12px 8px; font-weight: 600; color: #0f172a;'>" + escapeHtml(hospitalName) + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style='padding: 12px 8px; color: #64748b; font-weight: 600;'>Location / Address:</td>"
                + "        <td style='padding: 12px 8px; color: #334155;'>" + escapeHtml(hospitalAddress) + "</td>"
                + "      </tr>"
                + "    </table>"
                + "    <div style='background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #475569; line-height: 1.6;'>"
                + "      <div style='font-weight: 700; color: #1e293b; margin-bottom: 6px;'>Important Patient Instructions:</div>"
                + "      <ul style='margin: 0; padding-left: 20px;'>"
                + "        <li>Please arrive <strong>15 minutes prior</strong> to your scheduled consultation time.</li>"
                + "        <li>Please carry past prescriptions, test reports, and valid photo ID.</li>"
                + "        <li>You can view, manage, or reschedule this booking anytime by logging in with this email at the Swarnika Care Portal.</li>"
                + "      </ul>"
                + "    </div>"
                + "    <div style='background-color: #e0f2fe; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #0369a1;'>"
                + "      <strong>Need Assistance?</strong> Call Swarnika Lifeline at <a href='tel:18605001066' style='color: #0284c7; font-weight: 700; text-decoration: none;'>1860 500 1066</a> or email us at support@swarnikacare.com."
                + "    </div>"
                + "    <div style='font-size: 14px; line-height: 1.6; color: #334155;'>"
                + "      Warm regards,<br/>"
                + "      <strong style='color: #007b92;'>Team Swarnika Hospitals</strong>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background-color: #f8fafc; padding: 16px 30px; font-size: 11px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #e2e8f0; text-align: center;'>"
                + "    © 2026 Swarnika Hospitals & Care Network. All rights reserved.<br/>This is an automated confirmation email. Please do not reply directly to this message."
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
