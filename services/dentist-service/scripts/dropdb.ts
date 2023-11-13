import database from '../db/config';

/* Because this script uses TS imports, we need to transpile it to
 * JS before running it. To be able to test the service, we need to
 * have the whole service transpiled anyway, so ts-node is not
 * a suitable option. */
database?.exec('DROP TABLE IF EXISTS dentists;');
