import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';
const TIMEOUT = 10000;

/**
 * Wait for a response from MQTT before continuing processing of request
 * @param reqId the id that you are waiting a response for
 * @returns return a status.
 */
async function getServiceResponse (reqId: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client?.unsubscribe(RESPONSE_TOPIC);
      reject(new Error('MQTT timeout'));
    }, TIMEOUT);
    const eventHandler = (topic: string, message: Buffer): void => {
      if (topic === RESPONSE_TOPIC) {
        if (message.toString().startsWith(`${reqId}/`)) {
          clearTimeout(timeout);
          client?.unsubscribe(topic);
          client?.removeListener('message', eventHandler);
          resolve(message.toString().split('/')[1][0]);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
}

export const deleteDentist = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
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

  try {
    const mqttResult = await getServiceResponse(reqId.toString());
    if (mqttResult === '0') {
      return res.status(201).json({ message: 'Unable to authorize' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Service Timeout' });
  }

  const query = database.prepare('DELETE FROM dentists WHERE email = ?');
  const result = query.run(email);

  if (result.changes === 0) {
    // If no rows were affected, then dentist with the given email was not found
    return res.status(404).json({ message: 'Dentist not found' });
  }

  return res.json({ message: 'Dentist deleted successfully' });
};
