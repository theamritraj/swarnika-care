package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ClinicalOrderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class ClinicalOrderCreateRequest {

    @NotNull(message = "Order type is required (LAB or IMAGING)")
    private ClinicalOrderType orderType;

    @NotBlank(message = "Test or investigation name is required")
    private String testName;

    private String priority = "ROUTINE";
    private String clinicalIndication;

}
