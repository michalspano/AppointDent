import { type Request, type Response } from 'express';
import database from '../db/config';
import { sendServerError, sendNotFound } from './controllerUtils';

export const updatePatientController = (req: Request, res: Response): void => {
  try {
    const email = req.params.email;
    const updatedInfo = req.body;

    // console.log('Email: ', email);

    if (database === undefined) {
      sendServerError(res);
      return;
    }

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updatedInfo)) {
      fieldsToUpdate.push(`${key} = ?`);
      values.push(value);
    }

    const query = database.prepare(`
        UPDATE patients
        SET ${fieldsToUpdate.join(', ')}
        WHERE email = ?
      `);

    const result = query.run(...values, email);

    if (result.changes === undefined || result.changes === 0) {
      sendNotFound(res, 'Patient not found');
      return;
    }

    const updatedPatient = { email, ...updatedInfo };

    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    sendServerError(res);
  }
};
