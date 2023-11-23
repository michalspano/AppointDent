import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import { sendServerError, sendNotFound, sendUnauthorized } from './utils';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

/**
 * Used to update a patient's data in the system
 * @param req request
 * @param res response
 * @returns request object
 */
export const updatePatientController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    const email = req.params.email;
    const { sessionKey } = req.cookies;
    const updatedInfo = req.body;

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
    client.publish(TOPIC, `${reqId}/${email}/${sessionKey}/*`);
    client.subscribe(RESPONSE_TOPIC);

    try {
      const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
      if (mqttResult === '0') {
        return res.status(401).json({ message: 'Unable to authorize' });
      }
    } catch (error) {
      return res.status(504).json({ message: 'Service Timeout' });
    }

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(updatedInfo)) {
      fieldsToUpdate.push(`${key} = ?`);
      values.push(value);
    }

    const query = database.prepare(`
      UPDATE patients
      SET ${fieldsToUpdate.join(', ')}
      WHERE email = ?
    `);

    try {
      const result = query.run(...values, email);

      if (result.changes === undefined || result.changes === 0) {
        return sendNotFound(res, 'Patient not found');
      }

      const updatedPatient = { email, ...updatedInfo };
      return res.status(200).json(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);

      return sendServerError(res);
    }
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
export const updatePatientWrapper = (req: Request, res: Response): void => {
  void updatePatientController(req, res);
};
