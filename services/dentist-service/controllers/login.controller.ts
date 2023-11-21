import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';
const TIMEOUT = 10000;

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
          resolve(message.toString().split('/')[1]);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
}

export const login = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email, pass } = req.body;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }
  if (client === undefined) {
    return res.status(201).json({ message: 'MQTT connection failed' });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.publish(TOPIC, `${reqId}/${email}/${pass}/*`);
  client.subscribe(RESPONSE_TOPIC);
  let mqttResult;
  try {
    mqttResult = await getServiceResponse(reqId.toString());
    if (mqttResult === '0') {
      return res.status(201).json({ message: 'Unable to authorize' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Service Timeout' });
  }
  if (mqttResult !== undefined && mqttResult.length === 1 && mqttResult === '0') { // REQID/0/* (fail)
    return res.status(500).json({ message: 'Email or password is incorrect' });
  } else { // REQID/SESSIONKEY/* (success)
    res.cookie('sessionKey', mqttResult, { httpOnly: true });
    return res.status(200).json({ message: 'Login successful' });
  }
};
