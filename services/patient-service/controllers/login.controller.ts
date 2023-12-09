import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';

/**
 * Used to login a user with the help of mqtt into the system.
 * @param req request
 * @param res response
 * @returns request object
 */
export const loginController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  if (req.body.email === undefined) return res.sendStatus(400);
  if (req.body.password === undefined) return res.sendStatus(400);

  const { email, password } = req.body;
  if (database === undefined) {
    return res.sendStatus(500);
  }
  if (client === undefined) {
    return res.sendStatus(500);
  }

  try {
    const result = database.prepare('SELECT email FROM patients WHERE email = ?').get(req.body.email);

    if (result === undefined) {
      return res.sendStatus(404);
    }
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error: failed performing selection.'
    });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.subscribe(RESPONSE_TOPIC);
  client.publish(TOPIC, `${reqId}/${email}/${password}/*`);

  try {
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);

    if (mqttResult === '0') {
      return res.sendStatus(401);
    }

    if (mqttResult !== undefined && mqttResult.length === 1 && mqttResult === '0') {
      return res.sendStatus(400);
    } else {
      res.cookie('sessionKey', mqttResult, { httpOnly: true });
      return res.sendStatus(200);
    }
  } catch (error) {
    return res.sendStatus(500);
  } finally {
    client?.unsubscribe(RESPONSE_TOPIC);
  }
};
/**
 * Wraps the promise returning function to conform to ts constraints
 * @param req request
 * @param res response
 */
export const loginPatientWrapper = (req: Request, res: Response): void => {
  void loginController(req, res);
};
