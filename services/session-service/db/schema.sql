-- Schema definitions for the session service database

CREATE TABLE IF NOT EXISTS sessions (
    hash VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    expiry INT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    session_hash VARCHAR(64) UNIQUE
);
