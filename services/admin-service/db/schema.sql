-- Schema definitions for the admin service database

CREATE TABLE IF NOT EXISTS admins (
    email VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE
);