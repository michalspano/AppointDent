import database from '../db/config';
import type { Statement } from 'better-sqlite3';

/**
 * @description update the booking status of a particular appointment.
 */
const BOOKING_STATUS: Readonly<Statement<[string | null, string]>> = database?.prepare(`
  UPDATE appointments
  SET patientId = ?
  WHERE ROWID = ?
`) as Statement;

export { BOOKING_STATUS };
