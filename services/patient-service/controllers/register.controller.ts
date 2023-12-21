import QUERY from '../utils/query';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import type { Patient } from '../utils/types';
import type { Request, Response } from 'express';
import { getServiceResponse, isValidPatient } from './helper';

const TOPIC = 'INSERTUSER';
const RESPONSE_TOPIC = 'INSERTUSERRES';

/**
 * Used to register a new patient in the system
 * @param req request
 * @param res response
 * @returns request object
 */
export const registerController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  if (database === undefined || client === undefined) {
    return res.sendStatus(500);
  } else if (req.body.password === undefined) {
    return res.sendStatus(400);
  }

  // Extract the necessary information from the request body
  const request: Patient = {
    email: req.body.email,
    birthDate: req.body.birthDate,
    lastName: req.body.lastName,
    firstName: req.body.firstName
  };

  const password: string = req.body.password;

  /** Enforce the uniqueness constraint of the email and
   * ensure that the patient entry has followed the desired format.
   * Otherwise, return the appropriate status code. */
  if (checkEmailRegistered(request.email)) {
    return res.status(409).json('Email is already registered.');
  } else if (!isValidPatient(request)) {
    return res.status(400).json({ message: 'Invalid patient' });
  }

  // Publish via MQTT to the session-service
  const reqId = Math.floor(Math.random() * 1000);

  // To publish registration information to MQTT topic
  client.subscribe(RESPONSE_TOPIC);
  client.publish(TOPIC, `${reqId}/${request.email}/${password}/p/*`); // p for patient type

  try {
    // To wait for MQTT response; TODO: add types.
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    // To handle unsuccessful authorization
    if (mqttResult === '0') {
      return res.status(401).json('Email is already registered');
    }
  } catch (error) {
    console.error('Error in registerController:', error);
    return res.sendStatus(500);
  }

  /**
   * Session-service handled the insertion to the sessions, now insert to the patients table.
   * The patient entry has been validated, so, herein, the fail can only be an internal server error.
   */
  try {
    QUERY.INSERT_PATIENT.run(...Object.values(request));
  } catch (error) {
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
