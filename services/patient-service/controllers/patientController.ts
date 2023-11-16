import { type Request, type Response } from 'express';
import database from '../db/config';
import bcrypt from 'bcrypt';
import type * as BetterSqlite3 from 'better-sqlite3';

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

export const deletePatientController = (req: Request, res: Response): Response<any, Record<string, any>> => {
  try {
    const email = req.params.email;

    if (database === undefined) {
      sendServerError(res);
      return res.sendStatus(500);
    }

    const query = database.prepare('DELETE FROM patients WHERE email = ?');
    const result = query.run(email);

    if (result.changes === 0) {
      sendNotFound(res, 'Patient not found');
      return res.sendStatus(500);
    }

    return res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    sendServerError(res);
    return res.sendStatus(500);
  }
};

function sendCreated (res: Response, data: Record<string, any>): Response {
  return res.status(201).json(data);
}

function sendNotFound (res: Response, message: string): Response {
  return res.status(404).json({ message });
}

function sendServerError (res: Response): Response {
  return res.status(500).json({ message: 'Server Error' });
}
