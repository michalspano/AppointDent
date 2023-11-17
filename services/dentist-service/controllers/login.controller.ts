import type { Request, Response } from 'express';
import database from '../db/config';
import type { Dentist } from './types';
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

    const dentist = database.prepare('SELECT * FROM dentists WHERE email = ?').get(email) as Dentist;

    if (dentist === undefined) {
      res.status(401).json({ message: 'Invalid email or password' });
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
    let status;
    let sessionKey;
    if (result.length >= 3) {
      status = result[1][0];
      sessionKey = result[2][0];
    } else {
      console.error('Invalid data format:', result);
    }

    if (status === '1') {
      // Set the session key in an HTTP-only cookie (if needed)
      res.cookie('sessionKey', sessionKey, { httpOnly: true });
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(500).json({ message: 'Login Error' });
    }
  } catch (error) {
    console.error('Error handling MQTT login response:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}
