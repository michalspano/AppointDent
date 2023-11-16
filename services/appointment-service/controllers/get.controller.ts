import database from '../db/config';
import type { Request, Response } from 'express';

export const getAllAppointments = (req: Request, res: Response): void => {
  const result = database?.prepare('SELECT * FROM appointments').all();
  console.log(result);
  // TODO: Finish implementation
  res.status(200).json({ message: 'Not implemented.' });
};

export const getAppointment = (req: Request, res: Response): void => {
  // TODO: Finish implementation
  res.status(400).json({ message: 'Not implemented.' });
};
