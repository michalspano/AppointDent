import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
const TOPIC = 'INSERTUSER';
const RESPONSE_TOPIC = 'INSERTUSERRES';

/**
 * Used to register a new patient in the system
 * @param req request
 * @param res response
 * @returns request object
 */
export const registerController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const {
    email,
    password,
    birthDate,
    lastName,
    firstName
  } = req.body;
  // To verify if required dependencies are defined
  if (database === undefined) {
    return res.sendStatus(500);
  }
  if (client === undefined) {
    return res.sendStatus(500);
  }

  // To check if the email is already registered
  if (checkEmailRegistered(email)) {
    return res.sendStatus(400);
  }

  try {
  // To insert user into the database
    const query = database.prepare(`
    INSERT INTO patients 
    (email, password, birthDate, lastName, firstName) 
    VALUES (?, ?, ?, ?, ?)
  `);
    query.run(email, password, birthDate, lastName, firstName);
  } catch (err) {
    return res.sendStatus(400);
  }

  // To generate a random reqId
  const reqId = Math.floor(Math.random() * 1000);

  // To publish registration information to MQTT topic
  client.subscribe(RESPONSE_TOPIC);
  client.publish(TOPIC, `${reqId}/${email}/${password}/p/*`); // p for patient type

  try {
    // To wait for MQTT response
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    // To handle unsuccessful authorization
    if (mqttResult === '0') {
      return res.sendStatus(401);
    }
  } catch (error) {
    console.error('Error in registerController:', error);
    return res.sendStatus(500);
  }

  return res.sendStatus(201);
};

// To check if the email is already registered
function checkEmailRegistered (email: string): boolean {
  const checkEmailQuery = database?.prepare(`
    SELECT COUNT(*) as count
    FROM patients
    WHERE email = ?
  `);
  const emailCheckResult = checkEmailQuery?.get(email) as { count: number };

  return emailCheckResult !== null && emailCheckResult.count > 0;
};
/**
 * Wraps the promise returning function to conform to ts constraints
 * @param req request
 * @param res response
 */
export const registerPatientWrapper = (req: Request, res: Response): void => {
  void registerController(req, res);
};
