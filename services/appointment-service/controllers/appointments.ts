import database from '../db/config';
import type { Request, Response } from 'express';
import { type Statement } from 'better-sqlite3';
import { randomUUID } from 'crypto';
import type { UUID } from 'crypto';

export const getAllAppointments = (req: Request, res: Response): void => {
  const result = database?.prepare('SELECT * FROM appointments').all();
  console.log(result);
  // TODO: Finish implementation
  res.status(400).json({ message: 'Not implemented.' });
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

  const body: Record<string, number | string> | undefined = req.body;
  if (body === undefined) {
    res.status(400).json({
      message: 'Bad request: body is undefined.'
    });
    return;
  }

  // TODO: add a check that determines if the body is valid.
  // By valid we mean that it contains all the required fields.
  // If the body is not valid, return a 400 Bad Request response.

  const id: UUID = randomUUID();
  const stmt: Statement = database.prepare(
    'INSERT INTO appointments' +
    '(id, start_timestamp, end_timestamp, dentistId, patientId)' +
    'VALUES (?, ?, ?, ?, ?)'
  );

  try {
    stmt.run(id, Object.values(body)); // This is very unsafe and should only be done when the body is validated!
  } catch (err: Error | unknown) {
    res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  // Everything went well, return the created object.
  res.status(201).json({ id, ...body });
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
