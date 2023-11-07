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
const DB_FILE: string = 'db/sessions.db';

/**
 * @description the database instance with the options and the local
 * .db file.
 * Set the journal mode to WAL (Write-Ahead Logging) for better
 * and more optimized performance.
 */
const database: DatabaseType | undefined = (() => {
  try {
    const db = new Database(DB_FILE, options);
    db.pragma('journal_mode = WAL');
    return db;
  } catch (error: Error | unknown) { 
    return undefined;
  }
})();

export default database;