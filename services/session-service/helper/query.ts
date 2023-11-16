import database from '../db/config';
import { type QueryResult } from '../types/types';

export function executeQuery (query: string, params: unknown[], errorOnNoChange: boolean, errorOnUndefined: boolean): void {
  const preparedQuery = database?.prepare(query);
  let queryResult = preparedQuery?.run(params);
  if (queryResult === undefined && errorOnNoChange) throw (new Error('Insertion result undefined'));
  queryResult = queryResult as QueryResult;
  if (queryResult.changes === 0 && errorOnUndefined) throw (new Error('No changes made'));
}
