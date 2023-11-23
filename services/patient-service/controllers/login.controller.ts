import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { sendServerError, sendCreated, sendSuccess } from './utils';
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
  const { email, password } = req.body;
  if (database === undefined) {
    return sendServerError(res, 'Database undefined');
  }
  if (client === undefined) {
    return sendCreated(res, { message: 'MQTT connection failed' });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.subscribe(RESPONSE_TOPIC);
  client.publish(TOPIC, `${reqId}/${email}/${password}/*`);

  try {
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);

    if (mqttResult === '0') {
      return sendCreated(res, { message: 'Unable to authorize' });
    }

    if (mqttResult !== undefined && mqttResult.length === 1 && mqttResult === '0') {
      return sendServerError(res, 'Email or password is incorrect');
    } else {
      res.cookie('sessionKey', mqttResult, { httpOnly: true });
      return sendSuccess(res, 'Login successful');
    }
  } catch (error) {
    return sendServerError(res, 'Service Timeout');
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
