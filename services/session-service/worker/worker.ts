/* import { parentPort } from 'worker_threads';
import database from '../db/config';

parentPort?.on('message', ({ query, params }) => {
  try {
    const stmt = database?.prepare(query);
    const result = stmt?.all(params);

    // Send the result back to the main thread
    parentPort?.postMessage({ error: null, result });
  } catch (error) {
    // Send the error back if something went wrong
    parentPort?.postMessage({ error: error.message, result: null });
  }
});
*/
