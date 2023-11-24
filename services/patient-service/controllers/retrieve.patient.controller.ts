import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

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
      return res.sendStatus(500);
    }

    if (client === undefined) {
      return res.sendStatus(500);
    }

    if (sessionKey === undefined) {
      return res.sendStatus(400);
    }

    const reqId = Math.floor(Math.random() * 1000);
    client.subscribe(RESPONSE_TOPIC);
    client.publish(TOPIC, `${reqId}/${email}/${sessionKey}/*`);

    try {
      const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
      if (mqttResult === '0') {
        return res.sendStatus(401);
      }
    } catch (error) {
      return res.sendStatus(500);
    }

    let result: unknown[];
    try {
      result = database.prepare('SELECT email,birthDate,lastName,firstName FROM patients WHERE email = ?').all(email);
    } catch (err: Error | unknown) {
      console.log(err);
      return res.sendStatus(500);
    }
    return res.json(result);
  } catch (error) {
    console.error('Error updating patient:', error);

    return res.sendStatus(500);
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
