import { type Request, type Response } from 'express';
import database from '../db/config';
import bcrypt from 'bcrypt';

interface Patient {
  email: string
  pass: string
}

export const loginController = (req: Request, res: Response): void => {
  try {
    const { email, pass } = req.body;

    if (database === undefined) {
      sendServerError(res); return;
    }

    const patient = database.prepare('SELECT * FROM patients WHERE email = ?').get(email) as Patient;

    if (patient === undefined) {
      sendUnauthorized(res, 'Invalid email or password'); return;
    }

    bcrypt.compare(pass, patient.pass, (compareError: Error | undefined, passwordMatch: boolean) => {
      if (compareError != null) {
        sendServerError(res); return;
      }

      if (!passwordMatch) {
        sendUnauthorized(res, 'Invalid email or password'); return;
      }

      sendSuccess(res, 'Login successful');
    });
  } catch (error) {
    console.error('Error during login:', error);
    sendServerError(res);
  }
};

function sendServerError (res: Response): void {
  res.status(500).json({ message: 'Server Error' });
}

function sendUnauthorized (res: Response, message: string): void {
  res.status(401).json({ message });
}

function sendSuccess (res: Response, message: string): void {
  res.status(200).json({ message });
}
