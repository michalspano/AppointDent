import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import { sendServerError, sendNotFound, sendUnauthorized, sendSuccess } from './utils';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

/**
 * Used for deleting a patient from the system
 * @param req request
 * @param res response
 * @returns nothing
 */
export const deletePatientController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  try {
    const { email } = req.params;
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
      const mqttResult = await getServiceResponse(
        reqId.toString(),
        RESPONSE_TOPIC
      );
      if (mqttResult === '0') {
        return sendUnauthorized(res, 'Unable to authorize');
      }
    } catch (error) {
      return res.status(504).json({ message: 'Service Timeout' });
    }

    const query = database.prepare('DELETE FROM patients WHERE email = ?');
    const result = query.run(email);

    if (result.changes === 0) {
      return sendNotFound(res, 'Patient not found');
    }

    return sendSuccess(res, 'Patient deleted successfully');
  } catch (error) {
    console.error('Error deleting patient:', error);
    return sendServerError(res);
  }
};
/**
 * Wraps the promise returning deletion function in a sync function that is accepted by ts constraints.
 * @param req request
 * @param res response
 */
export const deletePatientWrapper = (req: Request, res: Response): void => {
  void deletePatientController(req, res);
};
