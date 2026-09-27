package com.swarnikacare.organization.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class StaffDirectoryResponse {
    private Long id;
    private String userId;
    private String email;
    private String role;
    private String employeeCode;
    private Long hospitalId;
    private String hospitalName;
    private String hospitalCode;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long designationId;
    private String designationName;
    private String designationCode;
    private Long positionId;
    private String positionTitle;
    private String positionCode;
    private Long reportingManagerId;
    private String reportingManagerName;
    private LocalDate joiningDate;
    private String employmentType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
