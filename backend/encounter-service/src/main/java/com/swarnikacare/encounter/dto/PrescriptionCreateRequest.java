package com.swarnikacare.encounter.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PrescriptionCreateRequest {
    private String notes;

    @NotEmpty(message = "Prescription must contain at least one medicine item")
    @Valid
    private List<PrescriptionItemDto> items;

}
