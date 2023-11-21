import { type Request, type Response } from 'express';
import database from '../db/config';
import { sendUnauthorized, sendServerError, sendSuccess } from './controllerUtils';

interface Patient {
  email: string
  pass: string
}

export const loginController = (req: Request, res: Response): void => {
  console.log('Here!!!');
  try {
    const { email, pass } = req.body;

    if (database === undefined) {
      sendServerError(res);
      return;
    }

    const patient = database.prepare('SELECT * FROM patients WHERE email = ?').get(email) as Patient;

    if (patient === undefined) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    if (patient.pass !== pass) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    /* bcrypt.compare(pass, patient.pass, (compareError: Error | undefined, passwordMatch: boolean) => {
      if (compareError != null) {
        sendServerError(res); return;
      }

      if (!passwordMatch) {
        sendUnauthorized(res, 'Invalid email or password'); return;
      }
      */

    sendSuccess(res, 'Login successful');
  } catch (error) {
    console.error('Error during login:', error);
    sendServerError(res);
    console.log('Here!!!');
  }
};
