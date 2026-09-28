import os

base_dir = "../backend/lab-service/src/main/java/com/swarnikacare/lab"

entities = {
    "LabTest": """package com.swarnikacare.lab.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_tests")
@Getter
@Setter
@NoArgsConstructor
public class LabTest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String testCode;
    @Column(nullable = false) private String testName;
    private String department;
    @Column(nullable = false) private String specimenType;
    private Integer turnaroundTimeMins;
    private Boolean isActive = true;
    @Column(nullable = false) private Long hospitalId;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
""",
    "LabOrder": """package com.swarnikacare.lab.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_orders")
@Getter
@Setter
@NoArgsConstructor
public class LabOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String orderNumber;
    @Column(nullable = false) private Long clinicalOrderId;
    @Column(nullable = false) private Long patientId;
    @Column(nullable = false) private Long doctorId;
    @Column(nullable = false) private Long hospitalId;
    private Long encounterId;
    @Column(nullable = false) private String status;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
""",
    "LabOrderItem": """package com.swarnikacare.lab.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_order_items")
@Getter
@Setter
@NoArgsConstructor
public class LabOrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long labOrderId;
    @Column(nullable = false) private Long testId;
    @Column(nullable = false) private String status;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
""",
    "Specimen": """package com.swarnikacare.lab.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "specimens")
@Getter
@Setter
@NoArgsConstructor
public class Specimen {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String accessionNumber;
    @Column(nullable = false) private Long labOrderId;
    @Column(nullable = false) private Long patientId;
    @Column(nullable = false) private Long hospitalId;
    @Column(nullable = false) private String specimenType;
    @Column(nullable = false) private String status;
    private Long collectedBy;
    private LocalDateTime collectedAt;
    private LocalDateTime receivedAt;
    private String rejectionReason;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
""",
    "LabResult": """package com.swarnikacare.lab.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "lab_results")
@Getter
@Setter
@NoArgsConstructor
public class LabResult {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long labOrderItemId;
    private Long specimenId;
    @Column(nullable = false) private Long patientId;
    @Column(nullable = false) private Long hospitalId;
    @Column(nullable = false) private String resultType;
    private BigDecimal numericValue;
    private String textValue;
    private String unit;
    private String referenceRange;
    private String abnormalFlag;
    private String comments;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private Long enteredBy;
    private Long verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime releasedAt;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
"""
}

repos = {
    "LabTestRepository": """package com.swarnikacare.lab.repository;
import com.swarnikacare.lab.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByHospitalId(Long hospitalId);
    Optional<LabTest> findByIdAndHospitalId(Long id, Long hospitalId);
    boolean existsByTestCodeAndHospitalId(String testCode, Long hospitalId);
}
""",
    "LabOrderRepository": """package com.swarnikacare.lab.repository;
import com.swarnikacare.lab.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
    List<LabOrder> findByHospitalId(Long hospitalId);
    Optional<LabOrder> findByIdAndHospitalId(Long id, Long hospitalId);
    List<LabOrder> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
    boolean existsByClinicalOrderIdAndHospitalId(Long clinicalOrderId, Long hospitalId);
}
""",
    "LabOrderItemRepository": """package com.swarnikacare.lab.repository;
import com.swarnikacare.lab.entity.LabOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabOrderItemRepository extends JpaRepository<LabOrderItem, Long> {
    List<LabOrderItem> findByLabOrderId(Long labOrderId);
    boolean existsByLabOrderIdAndTestId(Long labOrderId, Long testId);
}
""",
    "SpecimenRepository": """package com.swarnikacare.lab.repository;
import com.swarnikacare.lab.entity.Specimen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SpecimenRepository extends JpaRepository<Specimen, Long> {
    List<LabOrder> findByHospitalId(Long hospitalId);
    Optional<Specimen> findByIdAndHospitalId(Long id, Long hospitalId);
    List<Specimen> findByLabOrderIdAndHospitalId(Long labOrderId, Long hospitalId);
    List<Specimen> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
}
""",
    "LabResultRepository": """package com.swarnikacare.lab.repository;
import com.swarnikacare.lab.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    List<LabResult> findByHospitalId(Long hospitalId);
    Optional<LabResult> findByIdAndHospitalId(Long id, Long hospitalId);
    List<LabResult> findByLabOrderItemId(Long labOrderItemId);
    List<LabResult> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
    List<LabResult> findByPatientIdAndHospitalIdAndStatus(Long patientId, Long hospitalId, String status);
}
"""
}

def write_files(directory, file_dict):
    os.makedirs(os.path.join(base_dir, directory), exist_ok=True)
    for name, content in file_dict.items():
        with open(os.path.join(base_dir, directory, f"{name}.java"), "w") as f:
            f.write(content)

write_files("entity", entities)
write_files("repository", repos)

dtos = {
    "LabTestRequest": """package com.swarnikacare.lab.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LabTestRequest {
    @NotBlank private String testCode;
    @NotBlank private String testName;
    private String department;
    @NotBlank private String specimenType;
    private Integer turnaroundTimeMins;
    private Boolean active;
    @NotNull private Long hospitalId;
}""",
    "LabOrderRequest": """package com.swarnikacare.lab.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LabOrderRequest {
    @NotNull private Long clinicalOrderId;
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    @NotNull private Long hospitalId;
    private Long encounterId;
}""",
    "LabResultRequest": """package com.swarnikacare.lab.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class LabResultRequest {
    @NotNull private Long labOrderItemId;
    private Long specimenId;
    @NotNull private Long patientId;
    @NotNull private Long hospitalId;
    @NotBlank private String resultType;
    private BigDecimal numericValue;
    private String textValue;
    private String unit;
    private String referenceRange;
    private String abnormalFlag;
    private String comments;
}""",
    "ApiResponse": """package com.swarnikacare.lab.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
services = {
    "LabTestService": """package com.swarnikacare.lab.service;
import com.swarnikacare.lab.dto.LabTestRequest;
import com.swarnikacare.lab.entity.LabTest;
import com.swarnikacare.lab.repository.LabTestRepository;
import com.swarnikacare.lab.exception.DuplicateResourceException;
import com.swarnikacare.lab.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabTestService {
    private final LabTestRepository repository;

    public LabTest createTest(LabTestRequest request) {
        if (repository.existsByTestCodeAndHospitalId(request.getTestCode(), request.getHospitalId())) {
            throw new DuplicateResourceException("Test code already exists in hospital");
        }
        LabTest test = new LabTest();
        test.setTestCode(request.getTestCode());
        test.setTestName(request.getTestName());
        test.setDepartment(request.getDepartment());
        test.setSpecimenType(request.getSpecimenType());
        test.setTurnaroundTimeMins(request.getTurnaroundTimeMins());
        test.setHospitalId(request.getHospitalId());
        test.setIsActive(request.getActive() != null ? request.getActive() : true);
        return repository.save(test);
    }

    public List<LabTest> getTests(Long hospitalId) {
        return repository.findByHospitalId(hospitalId);
    }
}"""
}

controllers = {
    "LabTestController": """package com.swarnikacare.lab.controller;
import com.swarnikacare.lab.dto.LabTestRequest;
import com.swarnikacare.lab.dto.ApiResponse;
import com.swarnikacare.lab.entity.LabTest;
import com.swarnikacare.lab.service.LabTestService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/v1/lab/tests")
@RequiredArgsConstructor
public class LabTestController {
    private final LabTestService service;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    @PostMapping
    public ApiResponse<LabTest> createTest(@Valid @RequestBody LabTestRequest request) {
        return new ApiResponse<>(true, "Test created", service.createTest(request));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'LAB_TECHNICIAN')")
    @GetMapping
    public ApiResponse<List<LabTest>> getTests(@RequestParam Long hospitalId) {
        return new ApiResponse<>(true, "Tests retrieved", service.getTests(hospitalId));
    }
}"""
}

write_files("service", services)
write_files("controller", controllers)
print("Services and Controllers generated successfully.")
"""
}

write_files("dto", dtos)
print("DTOs generated successfully.")
