/**
 * utils/query.ts
 *
 * @description :: Prepared statements for the appointment service.
 * @version     :: 1.0
 */

import database from '../db/config';
import type { Statement } from 'better-sqlite3';

/**
 * @description retrieve all appointments from the database that are assigned to the
 * given patient.
 */
const APPOINTMENTS_BY_PATIENT: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT *
  FROM appointments
  WHERE patientId = ?
`) as Statement;

/**
 * @description retrieve a particular appointment based on its ID.
 */
const APPOINTMENT_BY_ID: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT *
  FROM appointments
  WHERE id = ?
`) as Statement;

/**
 * @description retrieve all appointments from the database that are not assigned to
 * any patient. Optionally, a range filter can be applied to the query.
 * @param hasRange apply a range filter to the query
 * @returns a prepared statement
 */
const UNASSIGNED_APPOINTMENTS = (hasRange: boolean): Readonly<Statement<[number?, number?]>> =>
  database?.prepare(`
    SELECT *
    FROM appointments
    WHERE patientId IS NULL
    ${hasRange ? ' AND start_timestamp >= ? AND end_timestamp <= ?' : ''}
`) as Statement;

/**
 * @description retrieve all appointments from the database that are assigned to the
 * given dentist. Optionally, a range filter can be applied to the query, and the
 * appointments can be filtered to retrieve only the available ones.
 * @param onlyAvailable flag to determine whether to retrieve only available appointments
 * @param hasRange flag to determine whether to apply a range filter to the query
 * @returns a prepared statement
 */
const APPOINTMENTS_BY_DENTIST = (onlyAvailable: boolean, hasRange: boolean):
Readonly<Statement<[string, number?, number?]>> => database?.prepare(`
    SELECT * FROM appointments WHERE dentistId = ?
    ${onlyAvailable ? ' AND patientId IS NULL' : ''}
    ${hasRange ? ' AND start_timestamp >= ? AND end_timestamp <= ?' : ''}
`) as Statement;

/**
 * @description retrieve the number of appointments in the database.
 * @param onlyAvailable flag to determine whether to retrieve only available appointments
 * @returns a prepared statement
 */
const COUNT_APPOINTMENTS = (onlyAvailable: boolean): Readonly<Statement<[]>> =>
  database?.prepare(`
    SELECT COUNT(*) as count
    FROM appointments
    ${onlyAvailable ? 'WHERE patientId IS NULL' : ''}
`) as Statement;

/**
 * @description select all subscriptions for a given patient of a particular dentist.
 */
const SUBSCRIPTIONS: Readonly<Statement<[string, string]>> = database?.prepare(`
  SELECT *
  FROM subscriptions
  WHERE dentistEmail = ? AND patientEmail = ?
`) as Statement;

/**
 * @description insert a new subscription into the database.
 */
const SUBSCRIPTION: Readonly<Statement<[string, string]>> = database?.prepare(`
  INSERT INTO subscriptions
  VALUES (?, ?)
`) as Statement;

/**
 * @description select all patients that are subscribed to a particular dentist.
 */
const SUBSCRIPTIONS_BY_DENTIST: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT patientEmail
  FROM subscriptions
  WHERE dentistEmail = ?
`) as Statement;

/**
 * @see SUBSCRIPTIONS_BY_DENTIST
 * Only the patient itself is not selected.
 */
const _SUBSCRIPTIONS_BY_DENTIST: Readonly<Statement<[string, string]>> = database?.prepare(`
  SELECT patientEmail
  FROM subscriptions
  WHERE dentistEmail = ? AND patientEmail != ?
`) as Statement;

/**
 * @description insert a new appointment into the database.
 */
const APPOINTMENT: Readonly<Statement<[string, number, number, string, (string | null)]>> = database?.prepare(`
  INSERT INTO appointments
  (id, start_timestamp, end_timestamp, dentistId, patientId)
  VALUES (?, ?, ?, ?, ?)
`) as Statement;

/**
 * @description remove a particular subscription from the database, based on the
 * dentist and patient emails.
 */
const SUBSCRIPTION_BY_IDS: Readonly<Statement<[string, string]>> = database?.prepare(`
  DELETE FROM subscriptions
  WHERE dentistEmail = ? AND patientEmail = ?
`) as Statement;

/**
 * @description remove a particular appointment from the database, based on its ID.
 */
const _APPOINTMENT_BY_ID: Readonly<Statement<[string]>> = database?.prepare(`
  DELETE FROM appointments
  WHERE id = ?
`) as Statement;

/**
 * @description update the booking status of a particular appointment.
 */
const BOOK_STATUS: Readonly<Statement<[string | null, string]>> = database?.prepare(`
  UPDATE appointments
  SET patientId = ?
  WHERE id = ?
`) as Statement;

export default {
  GET: {
    COUNT_APPOINTMENTS,
    SUBSCRIPTIONS,
    APPOINTMENT_BY_ID,
    APPOINTMENTS_BY_PATIENT,
    APPOINTMENTS_BY_DENTIST,
    UNASSIGNED_APPOINTMENTS,
    SUBSCRIPTIONS_BY_DENTIST,
    _SUBSCRIPTIONS_BY_DENTIST
  },
  POST: {
    APPOINTMENT,
    SUBSCRIPTION
  },
  DELETE: {
    SUBSCRIPTION_BY_IDS,
    _APPOINTMENT_BY_ID
  },
  PATCH: {
    BOOK_STATUS
  }
};
