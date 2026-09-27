package com.swarnikacare.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DepartmentCreateRequest {
    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;
    @NotBlank(message = "Department code is required")
    private String code;
    @NotBlank(message = "Department name is required")
    private String name;
    private String description;
    private Long headDoctorId;
    private Boolean publicVisibility = true;

}
