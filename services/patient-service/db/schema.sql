-- Schema definitions for the patient service database

CREATE TABLE IF NOT EXISTS patients (
    email VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    birthDate DATE NOT NULL,
    lastName VARCHAR(64) NOT NULL,
    firstName VARCHAR(64) NOT NULL
);
