package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NursingNoteDto {
    @NotNull
    private Long admissionId;
    @NotBlank
    private String noteType;
    @NotBlank
    private String content;

    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
