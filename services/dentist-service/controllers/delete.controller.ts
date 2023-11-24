import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'DELUSER';
const RESPONSE_TOPIC = 'DELUSERRES';

/**
 * Used to delete a dentist from the database.
 * @param req request
 * @param res response
 * @returns response object
 */
export const deleteDentist = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email } = req.params;
  const { sessionKey } = req.cookies;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }

  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
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

  const query = database.prepare('DELETE FROM dentists WHERE email = ?');
  const result = query.run(email);

  if (result.changes === 0) {
    // If no rows were affected, then dentist with the given email was not found
    return res.status(404).json({ message: 'Dentist not found' });
  }

  return res.status(200).json({ message: 'Dentist deleted successfully' });
};
/**
 * Used to wrap the async function in the sync function to satisfy TS constraints
 * @param req request
 * @param res response
 */
export const deleteDentistWrapper = (req: Request, res: Response): void => {
  void deleteDentist(req, res);
};
