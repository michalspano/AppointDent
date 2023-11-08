-- Schema definitions for the notification service database

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    _dateTime DATETIME NOT NULL, -- date + time combined
    message VARCHAR NOT NULL,    -- ideally, the message should not be empty
    appointment VARCHAR REFERENCES appointments(id) NOT NULL
);

