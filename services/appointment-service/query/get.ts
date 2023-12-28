import database from '../db/config';
import type { Statement } from 'better-sqlite3';

/**
 * @description retrieve a particular appointment based on its ID.
 */
const APPOINTMENT_BY_ID: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT *
  FROM appointments
  WHERE id = ?
`) as Statement;

/**
 * @description retrieve the number of appointments in the database.
 * @param onlyAvailable flag to determine whether to retrieve only available appointments
 * @returns a prepared statement
 */
const APPOINTMENT_COUNT = (onlyAvailable: boolean): Readonly<Statement<[]>> =>
  database?.prepare(`
    SELECT COUNT(*) as count
    FROM appointments
    ${onlyAvailable ? 'WHERE patientId IS NULL' : ''}
`) as Statement;

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
 * @description select all subscriptions for a given patient of a particular dentist.
 */
const SUBSCRIPTIONS: Readonly<Statement<[string, string]>> = database?.prepare(`
  SELECT *
  FROM subscriptions
  WHERE dentistEmail = ? AND patientEmail = ?
`) as Statement;

/**
 * @description a raw query for getting subscriptions based on
 * a dentist.
 */
const SUBSCRIPTION_BY_DENTIST_RAW: Readonly<string> = `
  SELECT patientEmail
  FROM subscriptions
  WHERE dentistEmail = ?
`;

/**
 * @description select all patients that are subscribed to a particular dentist.
 */
const SUBSCRIPTIONS_BY_DENTIST: Readonly<Statement<[string]>> = database?.prepare(
  SUBSCRIPTION_BY_DENTIST_RAW
) as Statement;

/**
 * @see SUBSCRIPTIONS_BY_DENTIST
 * Only the patient itself is not selected. Used when an 'unbooking' event is triggered.
 */
const SUBSCRIPTIONS_BY_DENTIST_UNBOOK: Readonly<Statement<[string, string]>> = database?.prepare(
  SUBSCRIPTION_BY_DENTIST_RAW + ' AND patientEmail != ?'
) as Statement;

export {
  APPOINTMENT_BY_ID,
  APPOINTMENT_COUNT,
  APPOINTMENTS_BY_PATIENT,
  APPOINTMENTS_BY_DENTIST,
  UNASSIGNED_APPOINTMENTS,
  SUBSCRIPTIONS,
  SUBSCRIPTIONS_BY_DENTIST,
  SUBSCRIPTIONS_BY_DENTIST_UNBOOK
};
