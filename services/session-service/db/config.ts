import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * @description the options for the database connection.
 */
const options: object = Object.freeze({
  fileMustExist: true,
  // TODO: add more options
});

/**
 * @description the name of the database file.
 */
const DB_FILE: string = 'sessions.db';

/**
 * @description the database instance with the options and the local
 * .db file.
 * Set the journal mode to WAL (Write-Ahead Logging) for better
 * and more optimized performance.
 */
const database: DatabaseType = new Database(DB_FILE, options);
database.pragma('journal_mode = WAL');

export default database;