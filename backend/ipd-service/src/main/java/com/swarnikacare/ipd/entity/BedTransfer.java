package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity @Table(name = "bed_transfers") @Data
public class BedTransfer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long admissionId;
    private Long hospitalId;
    private Long fromBedId;
    private Long toBedId;
    private String transferReason;
    private Long transferredBy;
    private LocalDateTime transferDate = LocalDateTime.now();
}