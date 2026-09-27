package com.swarnikacare.organization.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "employees", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id"})})
@Getter
@Setter
@NoArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, name = "user_id")
    private String userId;
    @Column(nullable = false, unique = true)
    private String employeeCode;
    @Column(nullable = false)
    private Long hospitalId;
    private Long departmentId;
    private Long designationId;
    private Long positionId;
    private Long reportingManagerId;
    private LocalDate joiningDate;
    private String employmentType;
    @Column(nullable = false)
    private String status;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
