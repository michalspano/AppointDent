import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'DELUSER';
const RESPONSE_TOPIC = 'DELUSERRES';

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
      const mqttResult = await getServiceResponse(
        reqId.toString(),
        RESPONSE_TOPIC
      );
      if (mqttResult === '0') {
        return res.sendStatus(401);
      }
    } catch (error) {
      return res.sendStatus(504);
    }

    const query = database.prepare('DELETE FROM patients WHERE email = ?');
    const result = query.run(email);

    if (result.changes === 0) {
      return res.sendStatus(404);
    }
    return res.sendStatus(204);
  } catch (error) {
    return res.sendStatus(500);
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
