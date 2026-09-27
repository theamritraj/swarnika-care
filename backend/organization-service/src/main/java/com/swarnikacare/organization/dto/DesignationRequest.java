package com.swarnikacare.organization.dto;

public class DesignationRequest {
    private String code;
    private String name;
    private String description;
    private String functionalArea;
    private Boolean active;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFunctionalArea() { return functionalArea; }
    public void setFunctionalArea(String functionalArea) { this.functionalArea = functionalArea; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
