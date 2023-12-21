import QUERY from '../utils/query';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { type Dentist } from '../utils/types';
import type { Request, Response } from 'express';
import { getServiceResponse, isValidDentist } from './helper';

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
   * Populate a new Dentist instance with the request body.
   */
  const request: Dentist = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    clinicCountry: req.body.clinicCountry,
    clinicCity: req.body.clinicCity,
    clinicStreet: req.body.clinicStreet,
    clinicHouseNumber: req.body.clinicHouseNumber,
    clinicZipCode: req.body.clinicZipCode,
    picture: req.body.picture,
    longitude: req.body.longitude,
    latitude: req.body.latitude
  };

  if (req.body.password === undefined) return res.status(400).json({ message: 'Password missing' });

  // Perform the necessary checks before continuing.
  if (database === undefined) {
    return res.status(500).json({ message: 'Database undefined' });
  } else if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  } else if (checkEmailRegistered(request.email)) {
    return res.status(409).json('Email is already registered');
  } else if (!isValidDentist(request)) {
    return res.status(400).json({ message: 'Invalid dentist' });
  }

  /**
   * If everything worked we should now be able to tell the session service to register a new user.
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
   * Execute SQL query on db. The fields are already validated, so only an error
   * with the IO (database) can occur (this is a 500 error).
   */
  try {
    QUERY.INSERT_DENTIST.run(...Object.values(request));
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  return res.sendStatus(201);
};

/**
 * Check if a certain email is a registered dentist
 * @param email email to check
 * @returns if the user is registered or not
 */

function checkEmailRegistered (email: string): boolean {
  const emailCheckResult = QUERY.DENTIST_COUNT.get(email) as { count: number };
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
