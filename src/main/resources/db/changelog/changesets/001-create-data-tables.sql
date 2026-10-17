--liquibase formatted SQL

--changeset pmichalczewski:001-create-data-tables
CREATE TABLE series (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_value NUMERIC(19, 4) NOT NULL,
    max_value NUMERIC(19, 4) NOT NULL,
    CONSTRAINT chk_series_min_max CHECK (min_value < max_value),
    color VARCHAR(7) NOT NULL,
    icon TEXT,
    unit VARCHAR(20)
);

CREATE TABLE sensors (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    series_id UUID NOT NULL,
    CONSTRAINT fk_sensor_series FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    api_key_hash VARCHAR(255) NOT NULL UNIQUE
);

CREATE INDEX idx_sensors_series_id ON sensors(series_id);
CREATE INDEX idx_sensors_api_key_hash ON sensors(api_key_hash);

CREATE TABLE measurements (
    id UUID PRIMARY KEY,
    series_id UUID NOT NULL,
    CONSTRAINT fk_measurement_series FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    sensor_id UUID,
    CONSTRAINT fk_measurement_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE SET NULL,
    value NUMERIC(19, 4) NOT NULL,
    measure_time TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_measurements_sensor_time ON measurements(sensor_id, measure_time DESC);
CREATE INDEX idx_measurements_series_time ON measurements(series_id, measure_time DESC);

--rollback DROP TABLE measurements; DROP TABLE sensors; DROP TABLE series;