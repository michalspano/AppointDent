-- Schema definitions for the notification service database

CREATE TABLE IF NOT EXISTS notifications (
    timestamp INTEGER NOT NULL, -- unix timestamp
    message VARCHAR NOT NULL,    -- notification message
    email VARCHAR NOT NULL    -- user email
);

