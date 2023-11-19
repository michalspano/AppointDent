import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

export const deleteDentist = (req: Request, res: Response): void => {
  const { email } = req.params;
  let { session } = req.headers;
  if (database === undefined) {
    res.status(500).send('Database undefined');
    return;
  }

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

  const query = database.prepare('DELETE FROM dentists WHERE email = ?');
  const result = query.run(email);

  if (result.changes === 0) {
    // If no rows were affected, then dentist with the given email was not found
    res.status(404).json({ message: 'Dentist not found' });
    return;
  }

  res.json({ message: 'Dentist deleted successfully' });
};

function handleMqttResponse (res: Response, message: Buffer): void {
  const result = message.toString();
  let status;
  if (result.length >= 3) {
    status = result.split('/')[1][0];
  }
  console.log(status);
  if (status === '0') {
    res.status(201).json({ message: 'Unable to authorize' });
    // eslint-disable-next-line no-useless-return
    return;
  }
}
