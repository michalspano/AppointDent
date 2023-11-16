import { type Request, type Response } from 'express';
import database from '../db/config';
import bcrypt from 'bcrypt';
import type * as BetterSqlite3 from 'better-sqlite3';

export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pass, birthDate, fName, lName } = req.body;

    if (database?.prepare == null) {
      sendServerError(res);
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(pass, 10);

      function isDatabaseDefined (obj: any): obj is BetterSqlite3.Database {
        return obj !== undefined && obj !== null && obj.prepare !== undefined;
      }

      if (!isDatabaseDefined(database)) {
        sendServerError(res);
        return;
      }
      const query = database.prepare(`
        INSERT INTO patients 
        (email, pass, birthDate, fName, lName) VALUES (?, ?, ?, ?, ?)`);

      query.run(email, hashedPassword, birthDate, fName, lName);

      const createdPatient = {
        email,
        birthDate,
        fName,
        lName
      };
      sendCreated(res, createdPatient);
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      sendServerError(res);
    }
  } catch (error) {
    console.error('Error registering patient:', error);
    sendServerError(res);
  }
};

function sendCreated (res: Response, data: Record<string, any>): Response {
  return res.status(201).json(data);
}

function sendServerError (res: Response): Response {
  return res.status(500).json({ message: 'Server Error' });
}
