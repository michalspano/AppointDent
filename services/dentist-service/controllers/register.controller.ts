import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';

const TOPIC = 'INSERTUSER';
const RESPONSE_TOPIC = 'INSERTUSERRES';
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
          resolve(message.toString().split('/')[1][0]);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
}

export const register = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email, pass, fName, lName, clinicCountry, clinicCity, clinicStreet, clinicHouseNumber, clinicZipCode, picture } = req.body;
  if (database === undefined) {
    return res.status(500).json({ message: 'Database undefined' });
  }
  if (client === undefined) {
    return res.status(201).json({ message: 'MQTT connection failed' });
  }

  const reqId = Math.floor(Math.random() * 1000); // Generates a random integer between 0 and 999
  client.publish(TOPIC, `${reqId}/${email}/${pass}/*`); // REQID/USERID/SECRET/*
  client.subscribe(RESPONSE_TOPIC);
  try {
    const mqttResult = await getServiceResponse(reqId.toString());
    if (mqttResult === '0') {
      return res.status(201).json({ message: 'Unable to authorize' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Service Timeout' });
  }

  // All checks passed, so inserting the user
  // Check if the email is already registered
  if (checkEmailRegistered(email)) {
    return res.status(500).json({ message: 'Email is already registered' });
  }

  const query = database.prepare(`
        INSERT INTO dentists 
        (email, pass, fName, lName, clinic_country, clinic_city, clinic_street, clinic_house_number, clinic_zipcode, picture) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
  query.run(email, pass, fName, lName, clinicCountry, clinicCity, clinicStreet, clinicHouseNumber, clinicZipCode, picture);

  const createdDentist = {
    email,
    fName,
    lName,
    clinicCountry,
    clinicCity,
    clinicStreet,
    clinicHouseNumber,
    clinicZipCode,
    picture
  };
  return res.status(201).json(createdDentist);
};

function checkEmailRegistered (email: string): boolean {
  // Check if the email is already registered
  const checkEmailQuery = database?.prepare(`
      SELECT COUNT(*) as count
      FROM dentists
      WHERE email = ?
    `);
  const emailCheckResult = checkEmailQuery?.get(email) as { count: number };

  return emailCheckResult !== null && emailCheckResult.count > 0;
}
