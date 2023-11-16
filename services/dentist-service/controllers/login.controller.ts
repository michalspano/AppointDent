import type { Request, Response } from 'express';
import database from '../db/config';
import { createHash } from 'crypto';
import type { Dentist } from './types';

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
