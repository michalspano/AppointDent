import QUERY from '../utils/query';
import database from '../db/config';
import type { LoginRequest } from '../utils/types';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import type { Request, Response } from 'express';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';

/**
 * Used to login a dentist into the system.
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

  try {
    // The email either exists or it doesn't.
    const result = QUERY.VERIFY_DENTIST.get(req.body.email) as string | undefined;
    if (result === undefined) return res.sendStatus(404);
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error: failed performing selection.'
    });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.subscribe(RESPONSE_TOPIC); // Subscribe first to ensure we dont miss anything
  client.publish(TOPIC, `${reqId}/${request.email}/${request.password}/*`);

  let mqttResult: string | undefined;
  try {
    mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    if (mqttResult === undefined || mqttResult === '0') {
      return res.status(401).json({ message: 'Unable to authorize' });
    }
  } catch (error) {
    return res.status(504).json({ message: 'Service Timeout' });
  }

  res.cookie('sessionKey', mqttResult, { httpOnly: true });
  return res.sendStatus(200);
};

/**
 * Wrap the login handler in a sync function for the route handler
 * @param req request
 * @param res response
 */
export const loginDentistWrapper = (req: Request, res: Response): void => {
  void login(req, res);
};
