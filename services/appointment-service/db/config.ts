import { readFileSync } from 'fs';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import fs from 'fs';

/**
 * @description the options for the database connection.
 */
const options: object = Object.freeze({
  fileMustExist: true
  // TODO: add more options
});

/**
 * @description the name of the database file.
 * When the test environment is used, the value of
 * DB_FILE is set to a custom path (typically <service>-test.db).
 * This way, we can seamlessly switch which local .db file is used.
 */
const DB_FILE: string = process.env.CUSTOM_DB_PATH ?? './db/appointments.db';

/**
 * @description the path to the schema file.
 */
const schemaFilePath: string = './db/schema.sql';

/* Verify that DB_FILE exists. If not, create it (just an empty file).
 * This eliminates the error that occurs when the database file does not exist
 * on the local machine. */
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '');

/**
 * @description the database instance with the options and the local
 * .db file.
 * Set the journal mode to WAL (Write-Ahead Logging) for better
 * and more optimized performance. For the scope of our project,
 * there should be no problem with this mode. However, consult
 * the documentation for more information.
 * @see https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
 */
const database: DatabaseType | undefined = (() => {
  try {
    const db = new Database(DB_FILE, options);
    db.pragma('journal_mode = WAL');
    // Load the schema file to the database.
    db.exec(readFileSync(schemaFilePath, 'utf8'));

    return db;
  } catch (error: Error | unknown) {
    console.log(error);
    return undefined;
  }
})();

export default database;
