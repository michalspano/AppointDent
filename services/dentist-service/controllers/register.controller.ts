import type { Request, Response } from 'express';
import database from '../db/config';
import { createHash } from 'crypto';
import type { RegistrationRequestBody } from './types';

export const register = (req: Request<string, unknown, RegistrationRequestBody>, res: Response): void => {
  try {
    const { email, pass, fName, lName, clinicCountry, clinicCity, clinicStreet, clinicHouseNumber, clinicZipCode, picture } = req.body;

    // Hash password before storing
    const hashedPassword = createHash('sha256').update(pass).digest('hex');
    if (database === undefined) {
      res.status(500).send('Database undefined');
      return;
    }

    const query = database.prepare(`
        INSERT INTO dentists 
        (email, pass, fName, lName, clinic_country, clinic_city, clinic_street, clinic_house_number, clinic_zipcode, picture) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

    query.run(email, hashedPassword, fName, lName, clinicCountry, clinicCity, clinicStreet, clinicHouseNumber, clinicZipCode, picture);

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

    res.status(201).json(createdDentist);
  } catch (error) {
    console.error('Error registering dentist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
