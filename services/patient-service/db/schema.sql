-- Schema definitions for the patient service database

CREATE TABLE IF NOT EXISTS patients (
    email VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL,
    birthDate DATE NOT NULL,
    lName VARCHAR(64) NOT NULL,
    fName VARCHAR(64) NOT NULL
);
