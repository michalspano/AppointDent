-- Schema definitions for the appointment service database

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    _dateTime DATETIME NOT NULL, -- date + time combined
    long VARCHAR(255) NOT NULL,
    lat VARCHAR(255) NOT NULL,
    dentistId VARCHAR(64) NOT NULL,
    patientId VARCHAR(64) NOT NULL,
);
