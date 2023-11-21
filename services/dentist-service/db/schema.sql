-- Schema definitions for the dentists service database

CREATE TABLE IF NOT EXISTS dentists (
    email VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL,
    fName VARCHAR(64) NOT NULL,
    lName VARCHAR(64) NOT NULL,
    clinic_country VARCHAR NOT NULL,
    clinic_city VARCHAR NOT NULL,
    clinic_street VARCHAR NOT NULL,
    clinic_house_number INT NOT NULL,
    clinic_zipcode INT NOT NULL,
    picture VARCHAR NOT NULL -- a base64 encoded image (taken as a string)
);
