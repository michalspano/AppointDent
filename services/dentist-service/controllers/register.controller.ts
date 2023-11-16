import type { Request, Response } from 'express';
import database from '../db/config';
import type { RegistrationRequestBody } from './types';
import { client } from '../mqtt/mqtt';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

export const register = (req: Request<string, unknown, RegistrationRequestBody>, res: Response): void => {
  try {
    const { email, pass, fName, lName, clinicCountry, clinicCity, clinicStreet, clinicHouseNumber, clinicZipCode, picture } = req.body;

    if (client === undefined) {
      res.status(201).json({ message: 'MQTT connection failed' });
      return;
    }
    const reqId = Math.floor(Math.random() * 1000); // Generates a random integer between 0 and 999
    client.publish(TOPIC, `${reqId}/${email}/${pass}*`); // REQID/USERID/SECRET*
    client.subscribe(RESPONSE_TOPIC);

    client.on('message', (topic: string, message: Buffer) => {
      if (topic === RESPONSE_TOPIC) {
        if (database === undefined) {
          res.status(500).send('Database undefined');
          return;
        }
        const result = message.toString();
        const status = result.split('/')[1].charAt(0); // check
        console.log(status, result.split('/'));
        if (status === '1') {
        // Authorization successful'

          // Check if the email is already registered
          const checkEmailQuery = database.prepare(`
          SELECT COUNT(*) as count
          FROM dentists
          WHERE email = ?
        `);

          const emailCheckResult = checkEmailQuery.get(email) as { count: number };
          // check if email is already registered before inserting
          if (emailCheckResult !== null && emailCheckResult.count > 0) {
            res.status(500).json({ message: 'Email is already registered' });
          } else {
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
          }
        } else {
          return res.status(500).json({ message: 'Authorization failed' });
        }
      }
    });
  } catch (error) {
    console.error('Error registering dentist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
