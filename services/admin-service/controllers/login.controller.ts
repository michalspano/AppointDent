import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

// admin credentials
const adminEmail = 'admin@gmail.com';
const adminPassword = 'password';
interface LoginRequest {
  email: string
  password: string
}
/**
 * Used to login an admin into the system.
 * @param req request
 * @param res response
 * @returns response object
 */
export const login = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const request: LoginRequest = req.body;
  if (database === undefined) {
    return res.status(500).json({ message: 'Database undefined' });
  }
  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  }
  if (request.email === undefined) return res.sendStatus(400);
  if (request.password === undefined) return res.sendStatus(400);

  // Perform checks for credentials validity
  try {
    if (!await performAdminLogin(request.email)) { // To handle unsuccessful authorization
      return res.status(401).json({ message: 'Invalid input' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Internal server error: failed performing admin login.'
    });
  }

  // Create session when checked that credentials are valid
  const TOPIC = 'CREATESESSION';
  const RESPONSE_TOPIC = 'SESSION';
  const reqId = Math.floor(Math.random() * 1000);
  client.subscribe(RESPONSE_TOPIC); // Subscribe first to ensure we don't miss anything
  client.publish(TOPIC, `${reqId}/${request.email}/${request.password}/*`);
  let mqttResult;
  try {
    mqttResult = (await getServiceResponse(reqId.toString(), RESPONSE_TOPIC)).split('/')[1];
  } catch (error) {
    return res.status(504).json({ message: 'Service Timeout' });
  }
  if (mqttResult !== undefined && mqttResult.length === 1 && mqttResult === '0') { // REQID/0/* (fail)
    return res.status(401).json({ message: 'Email or password is incorrect' });
  } else { // REQID/SESSIONKEY/* (success)
    res.cookie('sessionKey', mqttResult, { httpOnly: true });
    return res.sendStatus(200);
  }
};

const performAdminLogin = async (email: string): Promise<boolean> => {
  // Check if admin is already in the database
  const existingAdmin = database?.prepare('SELECT email FROM admins WHERE email = ?').get(email) as { email: string } | undefined;
  const dbEmptyResult = database?.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };

  if (existingAdmin != null) { // the only admin that can be inserted in the db is the one with correct credentials
    return true;
  } else if (dbEmptyResult.count === 0) {
    return await insertAdminCredentials();
  }
  return false;
};

// If db was wiped and there are no admin credentials yet
const insertAdminCredentials = async (): Promise<boolean> => {
  const query = database?.prepare(`
      INSERT INTO admins (email) VALUES (?)
    `);
  query?.run(adminEmail);

  const TOPIC = 'INSERTUSER';
  const RESPONSE_TOPIC = 'INSERTUSERRES';
  const reqId = Math.floor(Math.random() * 1000);

  // insert admin to sessions microservice
  client?.subscribe(RESPONSE_TOPIC);
  client?.publish(TOPIC, `${reqId}/${adminEmail}/${adminPassword}/a/*`); // a for admin type

  try {
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    return mqttResult.split('/')[1] === '1'; // return if insertion to sessions is successful
  } catch (error) {
    console.error('Error in registerController:', error);
  }
  return false;
};

/**
 * Wrap the login handler in a sync function for the route handler
 * @param req request
 * @param res response
 */
export const loginAdminWrapper = (req: Request, res: Response): void => {
  void login(req, res);
};
