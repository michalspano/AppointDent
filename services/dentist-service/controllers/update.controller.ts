import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';
import { type Dentist } from '../utils/types';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

/**
 * Used for PATCH requests to update a dentist's data.
 * @param req request
 * @param res response
 * @returns a response object
 */
export const updateDentist = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  if (req.cookies.sessionKey === undefined) return res.sendStatus(400);
  if (req.params.email === undefined) return res.sendStatus(400);
  const { email } = req.params;

  const { sessionKey } = req.cookies; // Get the session key from the cookies.
  const updatedInfo = req.body as Partial<Dentist>;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }
  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.publish(TOPIC, `${reqId}/${email}/${sessionKey}/*`); // reqId and session from body FE?
  client.subscribe(RESPONSE_TOPIC);

  /**
   * Wait for response from mqtt.
   */
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

  // Build the SET clause dynamically based on the provided fields in updatedInfo
  for (const [key, value] of Object.entries(updatedInfo)) {
    fieldsToUpdate.push(`${key} = ?`);
    values.push(value);
  }
  // In the case that an invalid field is provided, a 400 status code is returned
  let query;
  try {
    query = database.prepare(`
    UPDATE dentists
    SET ${fieldsToUpdate.join(', ')}
    WHERE email = ?
  `);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const result = query.run(...values, email);
    if (result.changes === undefined || result.changes === 0) {
      return res.status(404).json({ message: 'Dentist not found' });
    }
    const updatedDentist = { email, ...updatedInfo };
    return res.status(200).json(updatedDentist);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating dentist' });
  }
};

export const updateDentistWrapper = (req: Request, res: Response): void => {
  void updateDentist(req, res);
};
