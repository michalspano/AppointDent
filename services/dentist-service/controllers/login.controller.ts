import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { getServiceResponse } from './helper';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';

export const login = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email, password } = req.body;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }
  if (client === undefined) {
    return res.status(201).json({ message: 'MQTT connection failed' });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.publish(TOPIC, `${reqId}/${email}/${password}/*`);
  client.subscribe(RESPONSE_TOPIC);
  let mqttResult;
  try {
    mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC, true);
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

export const loginDentistWrapper = (req: Request, res: Response): void => {
  void login(req, res);
};
