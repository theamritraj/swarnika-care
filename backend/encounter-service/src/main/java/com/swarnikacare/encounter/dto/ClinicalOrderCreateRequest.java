package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ClinicalOrderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ClinicalOrderCreateRequest {

    @NotNull(message = "Order type is required (LAB or IMAGING)")
    private ClinicalOrderType orderType;

    @NotBlank(message = "Test or investigation name is required")
    private String testName;

    private String priority = "ROUTINE";
    private String clinicalIndication;

    public ClinicalOrderCreateRequest() {}

    public ClinicalOrderType getOrderType() { return orderType; }
    public void setOrderType(ClinicalOrderType orderType) { this.orderType = orderType; }
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getClinicalIndication() { return clinicalIndication; }
    public void setClinicalIndication(String clinicalIndication) { this.clinicalIndication = clinicalIndication; }
}
