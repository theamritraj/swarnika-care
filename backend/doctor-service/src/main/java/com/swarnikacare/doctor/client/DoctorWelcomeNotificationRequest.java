package com.swarnikacare.doctor.client;

public class DoctorWelcomeNotificationRequest {

    private String eventId;
    private String doctorName;
    private String doctorEmail;
    private String hospitalName;
    private String departmentName;
    private String designation;
    private String portalUrl;
    private String engagementType;

    public DoctorWelcomeNotificationRequest() {}

    public DoctorWelcomeNotificationRequest(String eventId, String doctorName, String doctorEmail, 
                                            String hospitalName, String departmentName, String designation, 
                                            String portalUrl, String engagementType) {
        this.eventId = eventId;
        this.doctorName = doctorName;
        this.doctorEmail = doctorEmail;
        this.hospitalName = hospitalName;
        this.departmentName = departmentName;
        this.designation = designation;
        this.portalUrl = portalUrl;
        this.engagementType = engagementType;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getDoctorEmail() { return doctorEmail; }
    public void setDoctorEmail(String doctorEmail) { this.doctorEmail = doctorEmail; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getPortalUrl() { return portalUrl; }
    public void setPortalUrl(String portalUrl) { this.portalUrl = portalUrl; }
    public String getEngagementType() { return engagementType; }
    public void setEngagementType(String engagementType) { this.engagementType = engagementType; }
}
