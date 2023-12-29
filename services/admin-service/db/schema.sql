-- Schema definitions for the admin service database

CREATE TABLE IF NOT EXISTS admins (
    email VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS requests (
    timestamp INT NOT NULL,
    method VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    clientHash VARCHAR(64) NOT NULL
);