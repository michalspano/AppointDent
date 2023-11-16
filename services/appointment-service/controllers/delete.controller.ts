import database from '../db/config';
import type { Request, Response } from 'express';
import { type Statement } from 'better-sqlite3';

// Delete all appointment entries; preserve the schema.
export const deleteAllAppointments = (req: Request, res: Response): void => {
  if (database === undefined) {
    res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
    return;
  }

  try {
    database.prepare('DELETE FROM appointments').run();
  } catch (err: Error | unknown) {
    res.status(500).json({
      message: 'Internal server error: query failed.'
    });
    return;
  }

  // Deletion was successful.
  res.status(204).end();
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

export default deleteAppointment;
