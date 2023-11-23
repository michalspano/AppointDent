-- Schema definitions for the dentists service database

CREATE TABLE IF NOT EXISTS dentists (
    email VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(64) NOT NULL,
    lastName VARCHAR(64) NOT NULL,
    clinicCountry VARCHAR NOT NULL,
    clinicCity VARCHAR NOT NULL,
    clinicStreet VARCHAR NOT NULL,
    clinicHouseNumber INT NOT NULL,
    clinicZipCode INT NOT NULL,
    picture VARCHAR NOT NULL -- a base64 encoded image (taken as a string)
);
