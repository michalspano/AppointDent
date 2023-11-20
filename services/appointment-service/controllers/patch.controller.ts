import database from '../db/config';
import { type Appointment } from '../types/types';
import type Database from 'better-sqlite3';
import { type Statement } from 'better-sqlite3';
import { destructUnknownToAppointment, parseToBookQuery } from '../utils';
import type { Request, Response } from 'express';

/*
 * Note: this is a note for the developer that takes on the continued
 * issue related to this controller. Basically, the type of the user
 * is not explicitly defined. Instead, how to determine the type of the
 * user is based on the following (supposing we extract the ID from the
 * session cookie):
 * - query the dentist-service to determine if the user exists in the
 *  dentist database. If so, then the user is a dentist.
 * - query the patient-service to determine if the user exists in the
 * patient database. If so, then the user is a patient.
 * Otherwise, the user is not authorized and an appropriate error should
 * be returned.*/

/**
 * @description the controller for the PATCH /appointments/:id route. In
 * terms of our system, this means 'booking, or un-booking an appointment'.
 * A query parameter, ?toBook=true|false, is used to determine whether the
 * appointment should be booked or unbooked. The default value is true.
 * 
 * An appointment is not booked by default, i.e., it is assigned to NO
 * patients, hence patientId is null. If the appointment is booked, then
 * patientId is not null.
 * 
 * @param req request object
 * @param res response object
 * @returns TODO: this is subject to change, hence edit this comment.
 */
const bookAppointment = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // TODO: properly handle the session and ensure that the route is protected.
  // Use MQTT and the session-service.

  // TODO: determine the type of the user based on the request (see above comments
  // for the explanation).

  const id: string = req.params.id;
  let appointment: unknown;
  try {
    appointment = database
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(id);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  if (appointment === undefined) {
    return res.status(404).json({
      message: `Appointment with id ${id} not found.`
    });
  }

  // In order to access the attributes of the appointment object, we need to
  // convert it to an actual Appointment object.
  const appointmentObj: Appointment = destructUnknownToAppointment(appointment);

  // We should not allow to book an already booked appointment.
  // A bad request error is returned. If the query is not given,
  // then the default value (true) is used.
  let toBook: boolean;
  try {
    toBook = parseToBookQuery(req.query.toBook);
  } catch (err: Error | unknown) {
    return res.status(400).json({
      message: 'Bad request: invalid query parameter.'
    });
  }

  if (appointmentObj.patientId !== null && toBook) {
    return res.status(400).json({
      message: 'Bad request: appointment is already booked.'
    });
  }

  // Update the appointment object with the patientId.
  appointmentObj.patientId = toBook ? req.body.patientId : null;
  
  const stmt: Statement = database.prepare(`
    UPDATE appointments
    SET patientId = ?
    WHERE id = ?
  `);

  try {
    const info: Database.RunResult = stmt.run(appointmentObj.patientId, appointmentObj.id);
    if (info.changes !== 1) {
      return res.status(500).json({ message: 'Internal server error: query malformed.' });
    }
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: edit failed.'
    });
  }

  // All went well, return the patched object.
  return res.status(200).json(appointmentObj);
};

export default bookAppointment;
