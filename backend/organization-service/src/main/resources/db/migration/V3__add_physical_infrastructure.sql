CREATE TABLE buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_building_hospital_code UNIQUE (hospital_id, code),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE floors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    building_id BIGINT NOT NULL,
    floor_number INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_floor_building_code UNIQUE (building_id, code),
    CONSTRAINT uk_floor_building_number UNIQUE (building_id, floor_number),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE units (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    building_id BIGINT NOT NULL,
    floor_id BIGINT NOT NULL,
    department_id BIGINT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    capacity INT DEFAULT 0,
    gender_restriction VARCHAR(50),
    age_group VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    public_visibility BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_unit_hospital_code UNIQUE (hospital_id, code),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (building_id) REFERENCES buildings(id),
    FOREIGN KEY (floor_id) REFERENCES floors(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    building_id BIGINT NOT NULL,
    floor_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    room_name VARCHAR(255),
    room_type VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 1,
    gender_restriction VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_room_unit_number UNIQUE (unit_id, room_number),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (building_id) REFERENCES buildings(id),
    FOREIGN KEY (floor_id) REFERENCES floors(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE beds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    building_id BIGINT NOT NULL,
    floor_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    bed_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    gender_restriction VARCHAR(50),
    is_isolation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_bed_room_number UNIQUE (room_id, bed_number),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (building_id) REFERENCES buildings(id),
    FOREIGN KEY (floor_id) REFERENCES floors(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE nursing_stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    building_id BIGINT NOT NULL,
    floor_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_ns_unit_code UNIQUE (unit_id, code),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (building_id) REFERENCES buildings(id),
    FOREIGN KEY (floor_id) REFERENCES floors(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
);
