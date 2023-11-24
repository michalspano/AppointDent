import type { Request, Response } from 'express';
import database from '../db/config';
import { client } from '../mqtt/mqtt';

/**
 * Used for GET requests to get a dentist's data.
 * @param req request
 * @param res response
 * @returns a response object
 */
export const getDentist = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email } = req.params;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }
  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  }

  let result: unknown[];
  try {
    result = database.prepare('SELECT email,firstName,lastName,clinicCountry,clinicCity,clinicStreet,clinicHouseNumber,clinicZipCode,picture FROM dentists WHERE email = ?').all(email);
  } catch (err: Error | unknown) {
    console.log(err);
    return res.sendStatus(500);
  }
  return res.json(result);
};

/**
 * Used for GET requests to get a dentist's data.
 * @param req request
 * @param res response
 * @returns a response object
 */
export const getAllDentists = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email } = req.params;
  if (database === undefined) {
    return res.status(500).send('Database undefined');
  }
  if (client === undefined) {
    return res.status(503).json({ message: 'MQTT connection failed' });
  }

  let result: unknown[];
  try {
    result = database.prepare('SELECT email,firstName,lastName,clinicCountry,clinicCity,clinicStreet,clinicHouseNumber,clinicZipCode,picture FROM dentists').all(email);
  } catch (err: Error | unknown) {
    console.log(err);
    return res.sendStatus(500);
  }
  return res.json(result);
};

export const retrieveDentistWrapper = (req: Request, res: Response): void => {
  void getDentist(req, res);
};
export const retrieveAllDentistWrapper = (req: Request, res: Response): void => {
  void getAllDentists(req, res);
};
