import database from '../db/config';
import { type Appointment } from '../types/types';
import type Database from 'better-sqlite3';
import { type Statement } from 'better-sqlite3';
import type { UUID } from 'crypto';
import { destructUnknownToAppointment } from '../utils';
import type { Request, Response } from 'express';

const editAppointment = (req: Request, res: Response): void => {
  if (database === undefined) {
    res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
    return;
  }

  // Ensure that there's some value that is to be patched.
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: 'Bad request: no values to edit.'
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

  // In order to access the attributes of the appointment object, we need to
  // convert it to an actual Appointment object.
  const appointmentObj: Appointment = destructUnknownToAppointment(appointment);

  // Replace all defined values with the ones passed in the request body.
  // Using this approach, we avoid hard-coding the attributes of the object.
  const patchedAppointment: Appointment = {
    id: id as UUID,
    start_timestamp: req.body.start_timestamp ?? appointmentObj.start_timestamp,
    end_timestamp: req.body.end_timestamp ?? appointmentObj.end_timestamp,
    dentistId: req.body.dentistId as UUID ?? appointmentObj.dentistId,
    patientId: req.body.patientId as UUID ?? appointmentObj.patientId
  };

  const stmt: Statement = database.prepare(`
    UPDATE appointments
    SET start_timestamp = ?, end_timestamp = ?, dentistId = ?, patientId = ?
    WHERE id = ?
  `);

  try {
    const info: Database.RunResult = stmt.run(
      Object.values(patchedAppointment).splice(1), // id is passed at the end in the `where` clause.
      id
    );
    // Exactly one should be patched!
    if (info.changes !== 1) {
      res.status(500).json({
        message: 'Internal server error: edit malformed.'
      });
    }
  } catch (err: Error | unknown) {
    res.status(500).json({
      message: 'Internal server error: edit failed.'
    });
    return;
  }

  // All went well, return the patched object.
  res.status(200).json(patchedAppointment);
};

export default editAppointment;
