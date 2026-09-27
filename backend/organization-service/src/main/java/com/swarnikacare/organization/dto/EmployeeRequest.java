package com.swarnikacare.organization.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class EmployeeRequest {
    private String userId;
    private String employeeCode;
    private Long hospitalId;
    private Long departmentId;
    private Long designationId;
    private Long positionId;
    private Long reportingManagerId;
    private LocalDate joiningDate;
    private String employmentType;
    private String status;

}
