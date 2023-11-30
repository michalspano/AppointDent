import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';

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

  const email = req.body.email;

  const performAdminLogin = async (): Promise<boolean> => {
    const result = database?.prepare('SELECT email FROM admins WHERE email = ?').get(email);
    if (result === undefined) {
      return await insertAdminCredentials();
    }
    return true;
  };

  const insertAdminCredentials = async (): Promise<boolean> => {
    const query = database?.prepare(`
      INSERT INTO admins (email, pass) VALUES (?, ?)
    `);
    query?.run(adminEmail, adminPassword);

    const TOPIC = 'INSERTUSER';
    const RESPONSE_TOPIC = 'INSERTUSERRES';

    // To generate a random reqId
    const reqId = Math.floor(Math.random() * 1000);

    // To publish registration information to MQTT topic
    client?.subscribe(RESPONSE_TOPIC);
    client?.publish(TOPIC, `${reqId}/${adminEmail}/${adminPassword}/a/*`); // a for admin type

    try {
    // To wait for MQTT response
      const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
      return mqttResult === '1';
    } catch (error) {
      console.error('Error in registerController:', error);
    }
    return false;
  };

  const loginAdmin = (): LoginRequest => {
    return database?.prepare('SELECT email FROM admins WHERE email = ?').get(email) as LoginRequest;
  };

  try {
    // To handle unsuccessful authorization
    if (!await performAdminLogin()) {
      console.log(performAdminLogin());
      return res.sendStatus(401);
    }
    if (loginAdmin() === undefined) {
      return res.status(400).json({ message: 'Invalid input' });
    }
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error: failed performing admin login.'
    });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.subscribe(RESPONSE_TOPIC); // Subscribe first to ensure we dont miss anything
  client.publish(TOPIC, `${reqId}/${request.email}/${request.password}/*`);
  let mqttResult;
  try {
    mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    if (mqttResult === '0') {
      return res.status(401).json({ message: 'Unable to authorize' });
    }
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

/**
 * Wrap the login handler in a sync function for the route handler
 * @param req request
 * @param res response
 */
export const loginAdminWrapper = (req: Request, res: Response): void => {
  void login(req, res);
};
