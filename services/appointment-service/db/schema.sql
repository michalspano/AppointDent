-- Schema definitions for the appointment service database

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    start_timestamp INT NOT NULL, 
    end_timestamp INT NOT NULL, 
    dentistId VARCHAR(64) NOT NULL,
    patientId VARCHAR(64) -- can be null: means that the appointment is not booked
);

CREATE TABLE IF NOT EXISTS subscriptions (
    dentistEmail VARCHAR(64) NOT NULL,
    -- TODO: store the name of the dentist, for the sake of readability;
    -- the user will be able to identify the dentist by the name, not by the email.
    patientEmail VARCHAR(64) NOT NULL
);