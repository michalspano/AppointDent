import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';
const WHOIS_TOPIC = 'WHOIS';
const WHOIS_RESPONSE_TOPIC = 'WHOISRES';
/**
 * Used to login a user with the help of mqtt into the system.
 * @param req request
 * @param res response
 * @returns request object
 */
export const loginController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email, password } = req.body;
  if (database === undefined) {
    return res.sendStatus(500);
  }
  if (client === undefined) {
    return res.sendStatus(500);
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
      return res.status(200).json({ email });
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

/**
 * Used to login a dentist into the system.
 * @param req request
 * @param res response
 * @returns response object
 */
export const whois = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { sessionKey } = req.cookies;

  if (database === undefined) {
    return res.status(500).json({ message: 'Database undefined' });
  }
  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.subscribe(WHOIS_RESPONSE_TOPIC); // Subscribe first to ensure we dont miss anything
  client.publish(WHOIS_TOPIC, `${reqId}/${sessionKey}/*`);
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
    return res.status(200).json({ email: mqttResult });
  }
};

/**
 * Wrap the login handler in a sync function for the route handler
 * @param req request
 * @param res response
 */
export const whoIsloginDentistWrapper = (req: Request, res: Response): void => {
  void whois(req, res);
};
