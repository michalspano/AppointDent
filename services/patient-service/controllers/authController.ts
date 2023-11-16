import { type Request, type Response } from 'express';
import database from '../db/config';
import type * as BetterSqlite3 from 'better-sqlite3';
import * as controllerUtils from './controllerUtils';

export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pass, birthDate, fName, lName } = req.body;

    if (database?.prepare == null) {
      controllerUtils.sendServerError(res);
      return;
    }

    try {
      function isDatabaseDefined (obj: any): obj is BetterSqlite3.Database {
        return obj !== undefined && obj !== null && obj.prepare !== undefined;
      }

      if (!isDatabaseDefined(database)) {
        controllerUtils.sendServerError(res);
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
      controllerUtils.sendCreated(res, createdPatient);
    } catch (error) {
      console.error('Error registering patient:', error);
      controllerUtils.sendServerError(res);
    }
  } catch (error) {
    console.error('Error registering patient:', error);
    controllerUtils.sendServerError(res);
  }
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function loginController (arg0: string, loginController: any) {
  throw new Error('Function not implemented.');
}
