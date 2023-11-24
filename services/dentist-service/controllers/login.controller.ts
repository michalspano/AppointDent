import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';
const WHOIS_TOPIC = 'WHOIS';
const WHOIS_RESPONSE_TOPIC = 'WHOISRES';
interface LoginRequest {
  email: string
  password: string
}
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
    return res.status(200).json({ email: request.email });
  }
};
/**
 * Wrap the login handler in a sync function for the route handler
 * @param req request
 * @param res response
 */
export const loginDentistWrapper = (req: Request, res: Response): void => {
  void login(req, res);
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
  void login(req, res);
};
