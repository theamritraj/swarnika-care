package com.swarnikacare.encounter.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "prescription_items", indexes = {
        @Index(name = "idx_item_presc", columnList = "prescription_id")
})
@Getter
@Setter
@NoArgsConstructor
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(nullable = false, length = 100)
    private String dosage;

    @Column(nullable = false, length = 100)
    private String frequency;

    @Column(nullable = false, length = 100)
    private String duration;

    @Column(length = 50)
    private String route;

    @Column(length = 255)
    private String instructions;

}
