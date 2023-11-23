import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import { sendServerError, sendNotFound, sendUnauthorized } from './controllerUtils';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

export const updatePatientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email;
    const { sessionKey } = req.cookies;
    const updatedInfo = req.body;

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
      const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
      if (mqttResult === '0') {
        res.status(401).json({ message: 'Unable to authorize' });
        return;
      }
    } catch (error) {
      res.status(504).json({ message: 'Service Timeout' });
      return;
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
        sendNotFound(res, 'Patient not found');
        return;
      }

      const updatedPatient = { email, ...updatedInfo };

      res.status(200).json(updatedPatient);
    } catch (error) {
      sendServerError(res);
    }
  } catch (error) {
    console.error('Error updating patient:', error);
    sendServerError(res);
  }
};
