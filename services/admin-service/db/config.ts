/**
 * db/config.ts
 *
 * @description :: Configuration file for the database.
 * @version     :: 1.0
 */

import { readFileSync } from 'fs';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * @description the options for the database connection.
 * The fileMustExit properly is set to default, which means,
 * that if the database file does not exist, it will be created.
 * We don't need to use a script to create the database file.
 *
 * We're using the verbose option to log all SQL queries to the console.
 * This is useful for debugging purposes.
 *
 * @see https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options
 */
const options: object = Object.freeze({
  verbose: console.log
  // TODO: add more options
});

/**
 * @description the name of the database file.
 * When the test environment is used, the value of
 * DB_FILE is set to a custom path (typically <service>-test.db).
 * This way, we can seamlessly switch which local .db file is used.
 */
const DB_FILE: string = process.env.CUSTOM_DB_ADMINS ?? './db/admins.db';

/**
 * @description the path to the schema file.
 */
const schemaFilePath: string = './db/schema.sql';

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
