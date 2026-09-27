-- ============================================================
-- V1__billing_schema.sql
-- Swarnika Care — Billing Service Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number      VARCHAR(64)    NOT NULL UNIQUE,
    patient_id          BIGINT         NOT NULL,
    hospital_id         BIGINT         NOT NULL,
    encounter_id        BIGINT,
    appointment_id      BIGINT,
    currency            VARCHAR(3)     NOT NULL DEFAULT 'INR',
    subtotal            DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax_amount          DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    discount_amount     DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    total_amount        DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    paid_amount         DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    outstanding_amount  DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    status              VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    issued_at           DATETIME,
    due_at              DATETIME,
    paid_at             DATETIME,
    notes               TEXT,
    created_by          VARCHAR(255),
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient (patient_id),
    INDEX idx_hospital (hospital_id),
    INDEX idx_status (status),
    INDEX idx_encounter (encounter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoice_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id      BIGINT         NOT NULL,
    item_type       VARCHAR(64)    NOT NULL,
    description     VARCHAR(512)   NOT NULL,
    quantity        INT            NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2)  NOT NULL,
    discount        DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax_rate        DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    line_total      DECIMAL(12,2)  NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_number      VARCHAR(64)    NOT NULL UNIQUE,
    invoice_id          BIGINT         NOT NULL,
    patient_id          BIGINT         NOT NULL,
    hospital_id         BIGINT         NOT NULL,
    amount              DECIMAL(12,2)  NOT NULL,
    currency            VARCHAR(3)     NOT NULL DEFAULT 'INR',
    payment_method      VARCHAR(64)    NOT NULL,
    status              VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    transaction_ref     VARCHAR(255),
    gateway_ref         VARCHAR(255),
    notes               TEXT,
    paid_at             DATETIME,
    refunded_at         DATETIME,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_patient (patient_id),
    INDEX idx_invoice (invoice_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS receipts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_number  VARCHAR(64)    NOT NULL UNIQUE,
    payment_id      BIGINT         NOT NULL,
    invoice_id      BIGINT         NOT NULL,
    patient_id      BIGINT         NOT NULL,
    hospital_id     BIGINT         NOT NULL,
    amount          DECIMAL(12,2)  NOT NULL,
    currency        VARCHAR(3)     NOT NULL DEFAULT 'INR',
    issued_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_patient (patient_id),
    INDEX idx_payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
