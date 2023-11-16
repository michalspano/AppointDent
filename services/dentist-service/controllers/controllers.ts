import type { Request, Response } from 'express';
import database from '../db/config';
import { createHash } from 'crypto';

// Interface representing a Dentist
interface Dentist {
  email: string
  pass: string
  fName: string
  lName: string
  clinic_country: string
  clinic_city: string
  clinic_street: string
  clinic_house_number: number
  clinic_zipcode: number
  picture: string
}
interface RegistrationRequestBody {
  email: string
  pass: string
  fName: string
  lName: string
  clinicCountry: string
  clinicCity: string
  clinicStreet: string
  clinicHouseNumber: string
  clinicZipCode: string
  picture: string
}

export const registerController = (req: Request<string, unknown, RegistrationRequestBody>, res: Response): void => {
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

export const loginController = (req: Request, res: Response): void => {
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

    const hashedPasswordInput = createHash('sha256').update(pass).digest('hex');

    // Compare the hashed password
    if (hashedPasswordInput !== dentist.pass) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateDentistController = (req: Request, res: Response): void => {
  const email = req.params.email;
  const updatedInfo = req.body;

  if (database === undefined) {
    res.status(500).send('Database undefined');
    return;
  }

  const fieldsToUpdate: string[] = [];
  const values: any[] = [];

  // Build the SET clause dynamically based on the provided fields in updatedInfo
  for (const [key, value] of Object.entries(updatedInfo)) {
    fieldsToUpdate.push(`${key} = ?`);
    values.push(value);
  }

  const query = database.prepare(`
    UPDATE dentists
    SET ${fieldsToUpdate.join(', ')}
    WHERE email = ?
  `);

  try {
    const result = query.run(...values, email);

    if (result.changes === undefined || result.changes === 0) {
      res.status(404).json({ message: 'Dentist not found' });
      return;
    }

    const updatedDentist = { email, ...updatedInfo };
    res.json(updatedDentist);
  } catch (error) {
    console.error('Error updating dentist:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteDentistController = (req: Request, res: Response): void => {
  const email = req.params.email;
  if (database === undefined) {
    res.status(500).send('Database undefined');
    return;
  }

  const query = database.prepare('DELETE FROM dentists WHERE email = ?');
  const result = query.run(email);

  if (result.changes === 0) {
    // If no rows were affected, then dentist with the given email was not found
    res.status(404).json({ message: 'Dentist not found' });
    return;
  }

  res.json({ message: 'Dentist deleted successfully' });
};
