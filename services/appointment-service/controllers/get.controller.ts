import database from '../db/config';
import type { Request, Response } from 'express';

// Get all appointments.
export const getAllAppointments = (req: Request, res: Response): void => {
  if (database === undefined) {
    res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
    return;
  }

  let result: unknown[];
  try {
    result = database.prepare('SELECT * FROM appointments').all();
  } catch (err: Error | unknown) {
    res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
    return;
  }

  res.status(200).json(result);
};

// Get an appointment by id.
export const getAppointment = (req: Request, res: Response): void => {
  if (database === undefined) {
    res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
    return;
  }

  const id: string = req.params.id;
  let appointment: unknown;
  try {
    appointment = database
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(id);
  } catch (err: Error | unknown) {
    res.status(500).json({
      message: 'Internal server error: query failed.'
    });
    return;
  }

  if (appointment === undefined) {
    res.status(404).json({
      message: `Appointment with id ${id} not found.`
    });
    return;
  }

  res.status(200).json(appointment);
};
