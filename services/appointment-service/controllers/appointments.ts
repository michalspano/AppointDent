import database from '../db/config';
import type { Request, Response } from 'express';
import { type Statement } from 'better-sqlite3';
import { randomUUID } from 'crypto';
import type { UUID } from 'crypto';

/**
 * @description the interface for the appointment object.
 * The id is a UUID (Universally Unique Identifier) and is
 * generated using the crypto module.
 */
interface Appointment {
  id: UUID
  start_timestamp: number
  end_timestamp: number
  dentistId: UUID
  patientId: UUID
};

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

// Create a new appointment.
export const createAppointment = (req: Request, res: Response): void => {
  if (database === undefined) {
    res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
    return;
  }

  const appointment: Appointment = {
    id: randomUUID(),
    start_timestamp: req.body.start_timestamp,
    end_timestamp: req.body.end_timestamp,
    dentistId: req.body.dentistId,
    patientId: req.body.patientId
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
    res.status(400).json({
      message: 'Bad request: invalid appointment object.'
    });
    return;
  }

  // Everything went well, return the created object.
  res.status(201).json({ ...appointment });
};

// Delete an appointment by id.
export const deleteAppointment = (req: Request, res: Response): void => {
  if (database === undefined) {
    res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
    return;
  }

  const id: string = req.params.id;
  let objToDelete: unknown;
  try {
    objToDelete = database
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(id);
  } catch (err: Error | unknown) {
    res.status(500).json({
      message: 'Internal server error: query failed.'
    });
    return;
  }

  if (objToDelete === undefined) {
    res.status(404).json({
      message: `Appointment with id ${id} not found.`
    });
    return;
  }

  // Object is found, process to delete it.
  const stmt: Statement = database.prepare('DELETE FROM appointments WHERE id = ?');
  try {
    stmt.run(id);
  } catch (err: Error | unknown) {
    res.status(500).json({
      message: 'Internal server error: query failed.'
    });
    return;
  }

  // Everything went well, return the deleted object.
  res.status(200).json(objToDelete);
};

export const editAppointment = (req: Request, res: Response): void => {
  // TODO: Finish implementation
  res.status(400).json({ message: 'Not implemented.' });
};
