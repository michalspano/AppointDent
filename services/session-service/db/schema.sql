-- Schema definitions for the session service database

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    expiry DATETIME NOT NULL
);
