import database from '../db/config';
import type { Statement } from 'better-sqlite3';

/**
 * @description remove a particular appointment from the database, based on its ID.
 */
const APPOINTMENT_BY_ID: Readonly<Statement<[string]>> = database?.prepare(`
  DELETE FROM appointments
  WHERE id = ?
`) as Statement;

/**
 * @description remove a particular subscription from the database, based on the
 * dentist and patient emails.
 */
const SUBSCRIPTION_BY_IDS: Readonly<Statement<[string, string]>> = database?.prepare(`
  DELETE FROM subscriptions
  WHERE dentistEmail = ? AND patientEmail = ?
`) as Statement;

export {
  APPOINTMENT_BY_ID,
  SUBSCRIPTION_BY_IDS
};
