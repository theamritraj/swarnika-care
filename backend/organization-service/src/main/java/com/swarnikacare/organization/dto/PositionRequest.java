package com.swarnikacare.organization.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PositionRequest {
    private Long hospitalId;
    private Long departmentId;
    private Long designationId;
    private String code;
    private String title;
    private String description;
    private Long reportsToPositionId;
    private String status;

}
