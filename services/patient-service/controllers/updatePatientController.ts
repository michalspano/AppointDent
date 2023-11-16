import { type Request, type Response } from 'express';
import database from '../db/config';
import { sendServerError, sendNotFound } from './controllerUtils';

export const updatePatientController = (req: Request, res: Response): Response<any, Record<string, any>> => {
  try {
    const email = req.params.email;
    const updatedInfo = req.body;

    if (database === undefined) {
      sendServerError(res);
      return res.sendStatus(500);
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
      return res.sendStatus(500);
    }

    const updatedPatient = { email, ...updatedInfo };

    return res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    sendServerError(res);
    return res.sendStatus(500);
  }
};
