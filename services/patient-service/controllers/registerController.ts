import { type Request, type Response } from 'express';
import database from '../db/config';
import type * as BetterSqlite3 from 'better-sqlite3';
import { sendServerError, sendCreated, sendBadRequest } from './controllerUtils';

export const registerController = (req: Request, res: Response): void => {
  // console.log('HERE!!');
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

      // Check if the email already exists in the database
      const checkEmailQuery = database.prepare('SELECT COUNT(*) as count FROM patients WHERE email = ?');
      const emailExists = (checkEmailQuery.get(email) as { count: number }).count > 0;

      if (emailExists) {
        // Email already exists, send a 400 Bad Request response
        sendBadRequest(res, 'Email already exists');
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
