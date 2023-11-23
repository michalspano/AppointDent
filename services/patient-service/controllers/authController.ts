import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { sendServerError, sendCreated, sendSuccess } from './controllerUtils';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';
const TIMEOUT = 10000;

async function getServiceResponse (reqId: string, RESPONSE_TOPIC: string, isLoginFlow: boolean = false): Promise<string> {
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
          isLoginFlow
            ? resolve(message.toString().split('/')[1])
            : resolve(message.toString().split('/')[1][0]);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
}

export const loginController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email, pass } = req.body;
  if (database === undefined) {
    return sendServerError(res, 'Database undefined');
  }
  if (client === undefined) {
    return sendCreated(res, { message: 'MQTT connection failed' });
  }

  const reqId = Math.floor(Math.random() * 1000);
  client.publish(TOPIC, `${reqId}/${email}/${pass}/*`);
  client.subscribe(RESPONSE_TOPIC);

  try {
    const mqttResult = await getServiceResponse(reqId.toString(), RESPONSE_TOPIC);

    if (mqttResult === '0') {
      return sendCreated(res, { message: 'Unable to authorize' });
    }

    if (mqttResult !== undefined && mqttResult.length === 1 && mqttResult === '0') {
      return sendServerError(res, 'Email or password is incorrect');
    } else {
      res.cookie('sessionKey', mqttResult, { httpOnly: true });
      return sendSuccess(res, 'Login successful');
    }
  } catch (error) {
    return sendServerError(res, 'Service Timeout');
  } finally {
    client?.unsubscribe(RESPONSE_TOPIC);
  }
};

export const loginPatientWrapper = (req: Request, res: Response): void => {
  void loginController(req, res);
};
