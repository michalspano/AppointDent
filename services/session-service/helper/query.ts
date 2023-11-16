import database from '../db/config';
import { type QueryResult } from '../types/types';

/**
 * Executes a query on the database.
 * @param query The SQL query to execute.
 * @param params An array of parameters to bind to the query.
 * @param errorOnNoChange Whether to throw an error if the query result is undefined.
 * @param errorOnUndefined Whether to throw an error if no changes are made by the query.
 */
export function executeQuery (query: string, params: unknown[], errorOnNoChange: boolean, errorOnUndefined: boolean): void {
  const preparedQuery = database?.prepare(query);
  let queryResult = preparedQuery?.run(params);
  if (queryResult === undefined && errorOnNoChange) throw (new Error('Insertion result undefined'));
  queryResult = queryResult as QueryResult;
  if (queryResult.changes === 0 && errorOnUndefined) throw (new Error('No changes made'));
}
