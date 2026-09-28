-- ============================================================
-- V2__billing_schema_updates.sql
-- Swarnika Care — Billing Service Schema Updates
-- ============================================================

CREATE TABLE IF NOT EXISTS charges (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id          BIGINT         NOT NULL,
    hospital_id         BIGINT         NOT NULL,
    encounter_id        BIGINT,
    category            VARCHAR(64)    NOT NULL,
    description         VARCHAR(512)   NOT NULL,
    quantity            INT            NOT NULL DEFAULT 1,
    unit_price          DECIMAL(12,2)  NOT NULL,
    discount            DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax_rate            DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    line_total          DECIMAL(12,2)  NOT NULL,
    status              VARCHAR(32)    NOT NULL DEFAULT 'CREATED',
    source              VARCHAR(64)    NOT NULL,
    created_by          VARCHAR(255),
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient (patient_id),
    INDEX idx_hospital (hospital_id),
    INDEX idx_encounter (encounter_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refunds (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    refund_reference    VARCHAR(64)    NOT NULL UNIQUE,
    payment_id          BIGINT         NOT NULL,
    invoice_id          BIGINT         NOT NULL,
    patient_id          BIGINT         NOT NULL,
    hospital_id         BIGINT         NOT NULL,
    amount              DECIMAL(12,2)  NOT NULL,
    reason              VARCHAR(512)   NOT NULL,
    status              VARCHAR(32)    NOT NULL DEFAULT 'INITIATED',
    processed_by        VARCHAR(255),
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_patient (patient_id),
    INDEX idx_payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS adjustments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id          BIGINT         NOT NULL,
    patient_id          BIGINT         NOT NULL,
    hospital_id         BIGINT         NOT NULL,
    amount              DECIMAL(12,2)  NOT NULL,
    reason              VARCHAR(512)   NOT NULL,
    actor               VARCHAR(255)   NOT NULL,
    original_balance    DECIMAL(12,2)  NOT NULL,
    resulting_balance   DECIMAL(12,2)  NOT NULL,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_invoice (invoice_id),
    INDEX idx_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
