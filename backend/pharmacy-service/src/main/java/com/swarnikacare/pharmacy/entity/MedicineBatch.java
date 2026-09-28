package com.swarnikacare.pharmacy.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;
@Entity @Table(name = "medicine_batches") @Data
public class MedicineBatch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long medicineId;
    private String batchNumber;
    private LocalDate expiryDate;
    private BigDecimal sellingPrice;
    private Integer quantity;
    private Integer availableQuantity;
    private Long hospitalId;
    private String status;
}