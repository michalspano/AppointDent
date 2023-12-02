/**
 * controllers/patch.controller.ts
 *
 * @description :: PATCH method for appointments.
 * @version     :: 1.0
 */

import * as utils from '../utils';
import { client } from '../mqtt/mqtt';
import database from '../db/config';
import type Database from 'better-sqlite3';
import { type Statement } from 'better-sqlite3';
import type { Request, Response } from 'express';
import { type AsyncResObj, SessionResponse, UserType, type Appointment, type WhoisResponse } from '../types/types';
import { type UUID } from 'crypto';

const TOPIC: string = utils.MQTT_PAIRS.whois.req;
const RESPONSE_TOPIC: string = utils.MQTT_PAIRS.whois.res;

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
 * @see verifySession
 * @see genReqId
 *
 * @param req request object
 * @param res response object
 * @returns A promise that resolves to a response object.
 */
const bookAppointment = async (req: Request, res: Response): AsyncResObj => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  if (client === undefined) {
    return res.status(503).json({
      message: 'Service unavailable: MQTT connection failed.'
    });
  }

  // Implies that the request expects only a patient.
  const email: string | undefined = req.query.patientId as string;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined || utils.isForbiddenId(email)) {
    return res.status(400).json({ message: 'Bad request: missing session key or email.' });
  }

  /* Access the `WHOIS` topic to determine the role of the user.
   * Furthermore, the email is returned and it needs to be matched
   * with the provided email in the request body. This way, we don't
   * need to call the session service twice. */
  const reqId: string = utils.genReqId();
  client.publish(TOPIC, `${reqId}/${sessionKey}/*`);
  client.subscribe(RESPONSE_TOPIC);

  try {
    const result: WhoisResponse = await utils.whoisByToken(
      reqId.toString(),
      RESPONSE_TOPIC
    );
    if (result.status !== SessionResponse.Success) {
      return res.status(401).json({ message: 'Unauthorized: invalid session.' });
    }

    // Restrict access to patients only.
    if (result.type !== UserType.Patient) {
      return res.status(403).json({ message: 'Forbidden: only patients can book appointments.' });
    }

    // Check if the emails match.
    // This case also handles when a non-existent email is provided.
    if (result.email !== email) {
      return res.status(403).json({ message: 'Forbidden: invalid email.' });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({
      message: 'Service timeout: unable to verify session.'
    });
  }

  // The verification step went well, we can proceed with the booking.
  const id: string = req.params.id;
  let appointment: Appointment | undefined;
  try {
    appointment = database
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(id) as Appointment;
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

  // We should not allow to book an already booked appointment.
  // A bad request error is returned. If the query is not given,
  // then the default value (true) is used.
  let toBook: boolean;
  try {
    toBook = utils.parseBinaryQueryParam(req.query.toBook, true);
  } catch (err: Error | unknown) {
    return res.status(400).json({
      message: 'Bad request: invalid query parameter.'
    });
  }

  if (appointment.patientId !== null && toBook) {
    return res.status(400).json({
      message: 'Bad request: appointment is already booked.'
    });
  }

  // Update the appointment object with the patientId.
  appointment.patientId = toBook ? email as UUID : null;

  const stmt: Statement = database.prepare(`
    UPDATE appointments
    SET patientId = ?
    WHERE id = ?
  `);

  try {
    const info: Database.RunResult = stmt.run(appointment.patientId, appointment.id);
    if (info.changes !== 1) {
      return res.status(500).json({ message: 'Internal server error: query malformed.' });
    }
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: edit failed.'
    });
  }

  // All went well, return the patched object.
  return res.status(200).json(appointment);
};

/**
 * @description a wrapper function for the bookAppointment function.
 *
 * @param req a request object
 * @param res a response object
 */
const bookAppointmentWrapper = (req: Request, res: Response): void => {
  void bookAppointment(req, res);
};

export default bookAppointmentWrapper;
