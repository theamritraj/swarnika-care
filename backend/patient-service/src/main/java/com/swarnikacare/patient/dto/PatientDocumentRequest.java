package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.PatientDocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PatientDocumentRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Document type is required")
    private PatientDocumentType documentType;

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private LocalDate receivedDate;
    private String notes;

}
