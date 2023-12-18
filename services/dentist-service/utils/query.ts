import database from '../db/config';
import type { Statement } from 'better-sqlite3';

/**
 * @description Retrieves the number of dentists with the given email.
 */
const DENTIST_COUNT: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT COUNT(*) as count
  FROM dentists
  WHERE email = ?
`) as Statement;

/**
 * @description Inserts a new dentist into the database.
 */
const INSERT_DENTIST: Readonly<Statement<[...Array<string | number>]>> = database?.prepare(`
  INSERT INTO dentists
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`) as Statement;

/**
 * @description Query used to determine if a dentist with the given email exists.
 * If it does, the same email is returned.
 */
const VERIFY_DENTIST: Readonly<Statement<[string]>> = database?.prepare(`
  SELECT email
  FROM dentists
  WHERE email = ?
`) as Statement;

export default {
  DENTIST_COUNT,
  INSERT_DENTIST,
  VERIFY_DENTIST
};
