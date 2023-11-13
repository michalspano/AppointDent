-- Schema definitions for the notification service database

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE, -- unique notification id
    timestamp DATETIME NOT NULL, -- unix timestamp
    message VARCHAR NOT NULL,    -- notification message
    email VARCHAR NOT NULL,    -- user email
);

