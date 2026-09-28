package com.swarnikacare.pharmacy.entity;
import jakarta.persistence.*;
import lombok.Data;
@Entity @Table(name = "medicines") @Data
public class Medicine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String code;
    private String name;
    private String unit;
    private Long hospitalId;
    private Boolean active;
}