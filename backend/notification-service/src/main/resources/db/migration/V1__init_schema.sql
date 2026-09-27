
CREATE TABLE IF NOT EXISTS processed_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_id (event_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_user_id VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255),
    patient_id BIGINT,
    hospital_id BIGINT,
    event_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    action_url VARCHAR(500),
    template_key VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    delivery_status VARCHAR(50) DEFAULT 'CREATED',
    failure_reason TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    correlation_id VARCHAR(100)
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_notifications_hospital ON notifications(hospital_id);
