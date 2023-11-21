import database from '../db/config';
import type { Request, Response } from 'express';
import { type Statement } from 'better-sqlite3';

// Delete all appointment entries; preserve the schema.
export const deleteAllAppointments = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  try {
    database.prepare('DELETE FROM appointments').run();
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  // Deletion was successful.
  return res.status(204).end();
};

// Delete an appointment by id.
export const deleteAppointment = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  const id: string = req.params.id;
  let objToDelete: unknown;
  try {
    objToDelete = database
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(id);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  if (objToDelete === undefined) {
    return res.status(404).json({
      message: `Appointment with id ${id} not found.`
    });
  }

  // Object is found, process to delete it.
  const stmt: Statement = database.prepare('DELETE FROM appointments WHERE id = ?');
  try {
    stmt.run(id);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  // Everything went well, return the deleted object.
  return res.status(200).json(objToDelete);
};

export default deleteAppointment;
