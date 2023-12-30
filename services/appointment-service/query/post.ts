import database from '../db/config';
import type { Statement } from 'better-sqlite3';

/**
 * @description insert a new appointment into the database.
 */
const APPOINTMENT: Readonly<Statement<[number, number, string, (string | null)]>> = database?.prepare(`
  INSERT INTO appointments
  (start_timestamp, end_timestamp, dentistId, patientId)
  VALUES (?, ?, ?, ?)
`) as Statement;

/**
 * @description insert a new subscription into the database.
 */
const SUBSCRIPTION: Readonly<Statement<[string, string]>> = database?.prepare(`
  INSERT INTO subscriptions
  VALUES (?, ?)
`) as Statement;

export {
  APPOINTMENT,
  SUBSCRIPTION
};
