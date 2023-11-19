import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';

export const login = (req: Request, res: Response): void => {
  try {
    const { email, pass } = req.body;

    if (database === undefined) {
      res.status(500).send('Database undefined');
      return;
    }

    if (client === undefined) {
      res.status(201).json({ message: 'MQTT connection failed' });
      return;
    }

    const reqId = Math.floor(Math.random() * 1000);
    client.publish(TOPIC, `${reqId}/${email}/${pass}/*`);
    client.subscribe(RESPONSE_TOPIC);

    client.on('message', (topic: string, message: Buffer) => {
      handleMqttLoginResponse(res, message);
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

function handleMqttLoginResponse (res: Response, message: Buffer): void {
  try {
    if (database === undefined) {
      res.status(500).send('Database undefined');
    }

    const result = message.toString();
    let sessionKey;
    if (result.length >= 3) {
      sessionKey = result.split('/')[1];
    } else {
      console.error('Invalid data format:', result);
    }
    if (sessionKey !== undefined && sessionKey.length === 1 && sessionKey === '0') { // REQID/0/* (fail)
      res.status(500).json({ message: 'Email or password is incorrect' });
    } else if (sessionKey !== undefined) { // REQID/SESSIONKEY/* (success)
      res.cookie('sessionKey', sessionKey, { httpOnly: true });
      res.status(200).json({ message: 'Login successful' });
    }
  } catch (error) {
    console.error('Error handling MQTT login response:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}
