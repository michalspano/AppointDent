import { type Request, type Response } from 'express';
import database from '../db/config';
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

      query.run(email, pass, birthDate, fName, lName);

      const createdPatient = {
        email,
        birthDate,
        fName,
        lName
      };
      sendCreated(res, createdPatient);
    } catch (error) {
      console.error('Error registering patient:', error);
      sendServerError(res);
    }
  } catch (error) {
    console.error('Error registering patient:', error);
    sendServerError(res);
  }
};
