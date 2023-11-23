import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import { sendServerError, sendNotFound, sendUnauthorized, sendSuccess } from './controllerUtils';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

export const deletePatientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const { sessionKey } = req.cookies;

    if (database === undefined) {
      sendServerError(res);
      return;
    }

    if (client === undefined) {
      sendUnauthorized(res, 'MQTT connection failed');
      return;
    }

    if (sessionKey === undefined) {
      res.status(400).json({ message: 'Missing session cookie' });
      return;
    }

    const reqId = Math.floor(Math.random() * 1000);
    client.publish(TOPIC, `${reqId}/${email}/${sessionKey}/*`);
    client.subscribe(RESPONSE_TOPIC);

    try {
      const mqttResult = await getServiceResponse(
        reqId.toString(),
        RESPONSE_TOPIC
      );
      if (mqttResult === '0') {
        sendUnauthorized(res, 'Unable to authorize');
        return;
      }
    } catch (error) {
      res.status(504).json({ message: 'Service Timeout' });
      return;
    }

    const query = database.prepare('DELETE FROM patients WHERE email = ?');
    const result = query.run(email);

    if (result.changes === 0) {
      sendNotFound(res, 'Patient not found');
      return;
    }

    sendSuccess(res, 'Patient deleted successfully');
  } catch (error) {
    console.error('Error deleting patient:', error);
    sendServerError(res);
  }
};

export const deletePatientWrapper = (req: Request, res: Response): void => {
  void deletePatientController(req, res);
};
