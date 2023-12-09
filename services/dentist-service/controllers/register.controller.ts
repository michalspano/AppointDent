import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import { type RegisterRequestKey, type RegisterRequest } from './types';

const TOPIC = 'INSERTUSER';
const RESPONSE_TOPIC = 'INSERTUSERRES';

/**
 * Used to register a new user in the system.
 * @param req request
 * @param res response
 * @returns response object
 */
export const register = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  /**
   * Assume the request is complete
   */
  const request: RegisterRequest = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    clinicCountry: req.body.clinicCountry,
    clinicCity: req.body.clinicCity,
    clinicStreet: req.body.clinicStreet,
    clinicHouseNumber: req.body.clinicHouseNumber,
    clinicZipCode: req.body.clinicZipCode,
    picture: req.body.picture
  };

  if (req.body.password === undefined) return res.status(400).json({ message: 'Password missing' });

  /**
   * Check if any fields are missing
   */
  for (const key of Object.keys(request) as RegisterRequestKey[]) {
    if (request[key] === undefined || request[key] === null) {
      return res.status(400).json({ message: 'Invalid input' });
    }
  }

  if (database === undefined) {
    return res.status(500).json({ message: 'Database undefined' });
  }
  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  }
  // Check if the email is already registered
  if (checkEmailRegistered(request.email)) {
    return res.status(409).json('Email is already registered');
  }

  const fieldsToUpdate: string[] = [];
  const values: any[] = [];

  // Build the SET clause dynamically based on the provided fields in updatedInfo
  for (const [key, value] of Object.entries(request)) {
    fieldsToUpdate.push(`${key}`);
    values.push(value);
  }

  /**
   * Build sql query dynamically and catch the potential error of having a missed field.
   */
  let query;
  try {
    query = database.prepare(`
    INSERT INTO dentists 
    (${fieldsToUpdate.join(', ')})
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: 'Invalid input' });
  }

  /**
   * If everything worked we should now be able to tell the session service to reqgister a new user.
   */
  const reqId = Math.floor(Math.random() * 1000); // Generates a random integer between 0 and 999
  client.subscribe(RESPONSE_TOPIC);
  client.publish(TOPIC, `${reqId}/${request.email}/${req.body.password}/d/*`); // REQID/USERID/SECRET/type/* d for dentist
  try {
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    if (mqttResult === '0') {
      return res.status(401).json('Email is already registered.');
    }
  } catch (error) {
    return res.status(504).json({ message: 'Service Timeout' });
  }

  /**
   * Execute SQL query on db.
   */
  query.run(...values);

  return res.sendStatus(201);
};

/**
 * Check if a certain email is a registered dentist
 * @param email email to check
 * @returns if the user is registered or not
 */

function checkEmailRegistered (email: string): boolean {
  // Check if the email is already registered
  const checkEmailQuery = database?.prepare(`
      SELECT COUNT(*) as count
      FROM dentists
      WHERE email = ?
    `);
  const emailCheckResult = checkEmailQuery?.get(email) as { count: number };

  return emailCheckResult !== null && emailCheckResult.count > 0;
}
/**
 * Wraps the promise returning funciton in a sync function.
 * @param req request
 * @param res response
 */
export const registerDentistWrapper = (req: Request, res: Response): void => {
  void register(req, res);
};
