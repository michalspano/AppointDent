/**
 * controllers/post.controller.ts
 *
 * @description :: POST method for appointments.
 * @version     :: 1.0
 */

import { randomUUID } from 'crypto';
import { client } from '../mqtt/mqtt';
import * as utils from '../utils';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import type { Request, Response } from 'express';
import { SessionResponse, type AsyncResObj, UserType, type Appointment, type WhoisResponse } from '../types/types';

const TOPIC: string = utils.MQTT_PAIRS.whois.req;
const RESPONSE_TOPIC: string = utils.MQTT_PAIRS.whois.res;

/**
 * @description the controller that creates an appointment.
 * This controller is protected by the session service. It can only be accessed
 * when a dentist is logged in and has a valid session. Furthermore, the dentist
 * can create an appointment only for themselves.
 *
 * @param req the request object
 * @param res the response object
 * @returns Asynchronous response JSON-like object.
 *
 * @see whoisByToken
 * @see AsyncResObj
 */
const createAppointment = async (req: Request, res: Response): AsyncResObj => {
  if (database === undefined) {
    return res.status(500).json({ message: 'Internal server error: database connection failed.' });
  }

  if (client === undefined) {
    return res.status(503).json({
      message: 'Service unavailable: MQTT connection failed.'
    });
  }

  const email: string | undefined = req.body.dentistId; // what the db uses
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined || email === undefined) {
    return res.status(400).json({ message: 'Bad request: missing session key or email.' });
  }

  // Use the `WHOIS` topic to determine the role of the user.
  // This, in turn, determines whether the user is allowed to create an appointment.
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

    // Restrict access to dentists only.
    if (result.type !== UserType.Dentist) {
      return res.status(403).json({
        message: 'Forbidden: only dentists can create appointments.'
      });
    }

    /* This means that a dentist is trying to create an appointment for another dentist.
     * This sort of behavior is not allowed. */
    if (result.email !== email) {
      return res.status(401).json({
        message: 'Unauthorized: attempt to create an appointment for another dentist.'
      });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({ message: 'Service timeout: unable to verify session.' });
  }

  // All went well, proceed with creating the appointment.
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

/**
 * @description a wrapper function for the createAppointment function.
 *
 * @param req a request object
 * @param res a response object
 */
const createAppointmentWrapper = (req: Request, res: Response): void => {
  void createAppointment(req, res);
};

export default createAppointmentWrapper;
