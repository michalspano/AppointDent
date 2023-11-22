import { randomUUID } from 'crypto';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import { type Appointment } from '../types/types';
import type { Request, Response } from 'express';

// Create a new appointment.
const createAppointment = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({ message: 'Internal server error: database connection failed.' });
  }

  const appointment: Appointment = {
    id: randomUUID(),
    start_timestamp: req.body.start_timestamp,
    end_timestamp: req.body.end_timestamp,
    dentistId: req.body.dentistId,
    patientId: null // Initially, the appointment is not booked (hence NULL).
  };

  const stmt: Statement = database.prepare(`
    INSERT INTO appointments
    (id, start_timestamp, end_timestamp, dentistId, patientId)
    VALUES (?, ?, ?, ?, ?)
  `);

  /* A query can fail because of a bad request (e.g. invalid object),
   * or that something is wrong with the database (an internal server error).
   * TODO: add proper error handling, so that the latter case is appropriately
   * handled with a 500 status code. */
  try {
    stmt.run(Object.values(appointment));
  } catch (err: Error | unknown) {
    return res.status(400).json({ message: 'Bad request: invalid appointment object.' });
  }

  // Everything went well, return the created object.
  return res.status(201).json(appointment);
};

export default createAppointment;
