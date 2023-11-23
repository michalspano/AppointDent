import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import { sendServerError, sendUnauthorized } from './utils';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

/**
 * Used to retrieve patient data as long as the patient is logged in.
 * @param req request
 * @param res response
 * @returns request object
 */
export const getPatientController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    const email = req.params.email;
    const { sessionKey } = req.cookies;

    if (database === undefined) {
      return sendServerError(res);
    }

    if (client === undefined) {
      return sendUnauthorized(res, 'MQTT connection failed');
    }

    if (sessionKey === undefined) {
      return res.status(400).json({ message: 'Missing session cookie' });
    }

    const reqId = Math.floor(Math.random() * 1000);
    client.subscribe(RESPONSE_TOPIC);
    client.publish(TOPIC, `${reqId}/${email}/${sessionKey}/*`);

    try {
      const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
      if (mqttResult === '0') {
        return res.status(401).json({ message: 'Unable to authorize' });
      }
    } catch (error) {
      return res.status(504).json({ message: 'Service Timeout' });
    }

    let result: unknown[];
    try {
      result = database.prepare('SELECT email,birthDate,lastName,firstName FROM patients WHERE email = ?').all(email);
    } catch (err: Error | unknown) {
      console.log(err);
      return res.status(500).json({
        message: 'Internal server error: fail performing selection.'
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating patient:', error);

    return sendServerError(res);
  }
};
/**
 * Wraps the promise returning function to conform to ts constraints
 * @param req request
 * @param res response
 */
export function getPatientWrapper (req: Request, res: Response): void {
  void getPatientController(req, res);
}
