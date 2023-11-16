import { type Request, type Response } from 'express';
import database from '../db/config';
import crypto from 'crypto';
import type * as BetterSqlite3 from 'better-sqlite3';
import { sendServerError, sendCreated } from './controllerUtils';

export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pass, birthDate, fName, lName } = req.body;

    if (database?.prepare == null) {
      sendServerError(res);
      return;
    }

    try {
      const hashedPassword = crypto.createHash('sha256').update(pass).digest('hex');

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
