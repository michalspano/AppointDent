import type { Request, Response } from 'express';
import database from '../db/config';
import { type Dentist } from './types';
import { client } from '../mqtt/mqtt';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

export const updateDentist = (req: Request, res: Response): void => {
  const { email } = req.params;
  let { session } = req.headers;
  const updatedInfo = req.body as Partial<Dentist>;

  if (client === undefined) {
    res.status(201).json({ message: 'MQTT connection failed' });
    return;
  }

  if (session === undefined) {
    res.status(400).json({ message: 'Missing session cookie' });
    return;
  } else if (Array.isArray(session)) {
    session = session.join(',');
  }
  const reqId = Math.floor(Math.random() * 1000);
  client.publish(TOPIC, `${reqId}/${email}/${session}/*`); // reqId and session from body FE?
  client.subscribe(RESPONSE_TOPIC);

  client.on('message', (topic: string, message: Buffer) => {
    handleMqttResponse(res, message);
  });

  if (!isValidDentistUpdate(updatedInfo)) {
    res.status(400).json({ message: 'Invalid update fields' });
    return;
  }

  if (database === undefined) {
    res.status(500).send('Database undefined');
    return;
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
      res.status(404).json({ message: 'Dentist not found' });
      return;
    }

    const updatedDentist = { email, ...updatedInfo };
    res.json(updatedDentist);
  } catch (error) {
    console.error('Error updating dentist:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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

function handleMqttResponse (res: Response, message: Buffer): void {
  const result = message.toString();
  let status;
  if (result.length >= 3) {
    status = result.split('/')[1][0];
  }
  if (status === '0') {
    res.status(201).json({ message: 'Unable to authorize' });
    // eslint-disable-next-line no-useless-return
    return;
  }
}
