import database from '../db/config';
import type { Statement } from 'better-sqlite3';

/**
 * @description Retrieves the number of patients with the given email.
 */
const PATIENT_COUNT: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT COUNT(*) as count
  FROM patients
  WHERE email = ?
`) as Statement;

/**
 * @description Inserts a new patient into the database.
 */
const INSERT_PATIENT: Readonly<Statement<[...string[]]>> = database?.prepare(`
  INSERT INTO patients
  VALUES (?, ?, ?, ?)
`) as Statement;

/**
 * @description Query used to determine if a patient with the given email exists.
 * If it does, the same email is returned.
 */
const VERIFY_PATIENT: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT email
  FROM patients
  WHERE email = ?
`) as Statement;

export default {
  PATIENT_COUNT,
  INSERT_PATIENT,
  VERIFY_PATIENT
};
