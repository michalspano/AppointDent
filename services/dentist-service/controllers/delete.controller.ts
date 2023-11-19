import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

export const deleteDentist = (req: Request, res: Response): Response<any, Record<string, any>> => {
  const { email } = req.params;
  let { session } = req.headers;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }

  if (client === undefined) {
    return res.status(201).json({ message: 'MQTT connection failed' });
  }

  if (session === undefined) {
    return res.status(400).json({ message: 'Missing session cookie' });
  } else if (Array.isArray(session)) {
    session = session.join(',');
  }
  const reqId = Math.floor(Math.random() * 1000);
  client.publish(TOPIC, `${reqId}/${email}/${session}/*`); // reqId and session from body FE?
  client.subscribe(RESPONSE_TOPIC);

  // Use a custom promise here. Ensure the event handler is killed before the request ends.
  client.on('message', (topic: string, message: Buffer) => {
    const result = handleMqttResponse(message);
    if (result === '0') {
      return res.status(201).json({ message: 'Unable to authorize' });
    }
  });

  const query = database.prepare('DELETE FROM dentists WHERE email = ?');
  const result = query.run(email);

  if (result.changes === 0) {
    // If no rows were affected, then dentist with the given email was not found
    return res.status(404).json({ message: 'Dentist not found' });
  }

  return res.json({ message: 'Dentist deleted successfully' });
};

function handleMqttResponse (message: Buffer): string { // Ensure to not give helper functions the power to return status. Only the controller function should do that. Otherwise things get messy.
  const result = message.toString();
  if (result.length >= 3) { // Return actual status if defined
    return result.split('/')[1][0];
  }
  return '0';
}
