import QUERY from '../utils/query';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import type { Patient } from '../utils/types';
import type { Request, Response } from 'express';

const TOPIC = 'INSERTUSER';
const RESPONSE_TOPIC = 'INSERTUSERRES';

/**
 * Used to register a new patient in the system
 * @param req request
 * @param res response
 * @returns request object
 */
export const registerController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  // TODO: extract this to a function
  if (req.body.email === undefined) return res.sendStatus(400);
  if (req.body.password === undefined) return res.sendStatus(400);
  if (req.body.birthDate === undefined) return res.sendStatus(400);
  if (req.body.lastName === undefined) return res.sendStatus(400);
  if (req.body.firstName === undefined) return res.sendStatus(400);

  const {
    email, birthDate, lastName, firstName
  } = req.body as Patient;
  const password: string = req.body.password;

  if (database === undefined || client === undefined) return res.sendStatus(500);

  if (checkEmailRegistered(email)) {
    return res.status(409).json({
      message: 'Email is already registered.'
    });
  }

  // Attempt to insert the patient into the database.
  try {
    QUERY.INSERT_PATIENT.run(email, birthDate, lastName, firstName);
  } catch (error) {
    return res.sendStatus(500);
  }

  /**
   * Insertion successful, now publish to MQTT.
   */
  const reqId = Math.floor(Math.random() * 1000);

  // To publish registration information to MQTT topic
  client.subscribe(RESPONSE_TOPIC);
  client.publish(TOPIC, `${reqId}/${email}/${password}/p/*`); // p for patient type

  try {
    // To wait for MQTT response
    // TODO: add types.
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    // To handle unsuccessful authorization
    if (mqttResult === '0') {
      return res.status(401).json({
        message: 'Email is already registered'
      });
    }
  } catch (error) {
    console.error('Error in registerController:', error);
    return res.sendStatus(500);
  }

  return res.sendStatus(201);
};

// To check if the email is already registered
function checkEmailRegistered (email: string): boolean {
  const emailCheckResult = QUERY.PATIENT_COUNT.get(email) as { count: number };
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
