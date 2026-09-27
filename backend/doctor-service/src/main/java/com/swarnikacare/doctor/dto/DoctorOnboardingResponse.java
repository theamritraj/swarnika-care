package com.swarnikacare.doctor.dto;

public class DoctorOnboardingResponse {
    private Long doctorId;
    private String doctorName;
    private String email;
    private String hospitalName;
    private String departmentName;
    private String designation;
    private String welcomeEmailStatus;
    private String message;

    public DoctorOnboardingResponse() {}

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getWelcomeEmailStatus() { return welcomeEmailStatus; }
    public void setWelcomeEmailStatus(String welcomeEmailStatus) { this.welcomeEmailStatus = welcomeEmailStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
