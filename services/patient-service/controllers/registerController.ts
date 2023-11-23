import { type Request, type Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import { sendServerError, sendCreated, sendBadRequest } from './controllerUtils';

interface PatientRegistrationRequest {
  email: string
  pass: string
  birthDate: string
  fName: string
  lName: string
}

interface PatientRegistrationResponse {
  email: string
  birthDate: string
  fName: string
  lName: string
}

const TOPIC = 'INSERTUSER';
const RESPONSE_TOPIC = 'INSERTUSERRES';
const TIMEOUT = 10000;

export const registerController = async (req: Request<Record<string, unknown>, unknown, PatientRegistrationRequest>, res: Response<PatientRegistrationResponse>): Promise<void> => {
  try {
    const { email, pass, birthDate, fName, lName } = req.body;

    if ((database == null) || (client == null)) {
      sendServerError(res, 'Database or MQTT connection is undefined');
      return;
    }

    const reqId = Math.floor(Math.random() * 10000).toString();
    const mqttRequestMessage = `${reqId}/${email}/${pass}/*`;

    client.publish(TOPIC, mqttRequestMessage);
    client.subscribe(RESPONSE_TOPIC);

    try {
      const mqttResult = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('MQTT timeout'));
        }, TIMEOUT);
        const eventHandler = (topic: string, message: Buffer): void => {
          if (topic === RESPONSE_TOPIC) {
            if (message.toString().startsWith(`${reqId}/`)) {
              clearTimeout(timeout);
              client?.unsubscribe(RESPONSE_TOPIC);
              client?.removeListener('message', eventHandler);
              resolve(message.toString().split('/')[1][0]);
            }
          }
        };
        client?.on('message', eventHandler);
      });

      if (mqttResult === '0') {
        sendBadRequest(res, 'Unable to authorize');
        return;
      }
    } catch (error) {
      sendServerError(res, 'Service Timeout');
      return;
    } finally {
      client?.unsubscribe(RESPONSE_TOPIC);
    }

    if (checkEmailRegistered(email)) {
      sendBadRequest(res, 'Email is already registered');
      return;
    }

    const query = database.prepare(`
      INSERT INTO patients 
      (email, pass, birthDate, fName, lName) 
      VALUES (?, ?, ?, ?, ?)
    `);

    query.run(email, pass, birthDate, fName, lName);

    const createdPatient = {
      email,
      birthDate,
      fName,
      lName
    };

    sendCreated(res, createdPatient);
  } catch (error) {
    sendServerError(res, 'Error registering patient');
  }
};

function checkEmailRegistered (email: string): boolean {
  const checkEmailQuery = database?.prepare(`
    SELECT COUNT(*) as count
    FROM patients
    WHERE email = ?
  `);

  const emailCheckResult = checkEmailQuery?.get(email) as { count: number };
  return emailCheckResult !== null && emailCheckResult.count > 0;
};
export const registerPatientWrapper = (req: Request, res: Response): void => {
  void registerController(req, res);
};
