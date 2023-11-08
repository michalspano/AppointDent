-- Schema definitions for the session service database

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    _dateTime DATETIME NOT NULL, -- date + time combined
    location VARCHAR(255) NOT NULL,
    dentist VARCHAR REFERENCES dentists(email) NOT NULL,
    patient VARCHAR REFERENCES patients(email) NOT NULL
);
