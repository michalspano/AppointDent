import type { Request, Response } from 'express';
import database from '../db/config';
import { type Dentist } from './types';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

export const updateDentist = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email } = req.params;
  let { session } = req.headers;
  const updatedInfo = req.body as Partial<Dentist>;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }
  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  }

  if (session === undefined) {
    return res.status(400).json({ message: 'Missing session cookie' });
  } else if (Array.isArray(session)) {
    session = session.join(',');
  }
  const reqId = Math.floor(Math.random() * 1000);
  client.publish(TOPIC, `${reqId}/${email}/${session}/*`); // reqId and session from body FE?
  client.subscribe(RESPONSE_TOPIC);

  try {
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);
    if (mqttResult === '0') {
      return res.status(401).json({ message: 'Unable to authorize' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Service Timeout' });
  }

  if (!isValidDentistUpdate(updatedInfo)) {
    return res.status(400).json({ message: 'Invalid update fields' });
  }

  const fieldsToUpdate: string[] = [];
  const values: any[] = [];

  // Build the SET clause dynamically based on the provided fields in updatedInfo
  for (const [key, value] of Object.entries(updatedInfo)) {
    fieldsToUpdate.push(`${key} = ?`);
    values.push(value);
  }

  const query = database.prepare(`
    UPDATE dentists
    SET ${fieldsToUpdate.join(', ')}
    WHERE email = ?
  `);

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

const isValidDentistUpdate = (updatedInfo: Partial<Dentist>): boolean => {
  const isValidKeys = Object.keys(updatedInfo).every((key) => {
    return (['fName', 'lName', 'clinic_country', 'clinic_city', 'clinic_street', 'clinic_house_number', 'clinic_zipcode', 'picture'] as Array<keyof Dentist>).includes(key as keyof Dentist);
  });

  if (!isValidKeys) {
    return false;
  }
  return true;
};

export const updateDentistWrapper = (req: Request, res: Response): void => {
  void updateDentist(req, res);
};
