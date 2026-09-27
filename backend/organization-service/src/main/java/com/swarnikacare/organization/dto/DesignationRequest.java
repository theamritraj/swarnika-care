package com.swarnikacare.organization.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class DesignationRequest {
    private String code;
    private String name;
    private String description;
    private String functionalArea;
    private Boolean active;

}
