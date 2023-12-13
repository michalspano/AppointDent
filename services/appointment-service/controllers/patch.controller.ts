/**
 * controllers/patch.controller.ts
 *
 * @description :: PATCH method for appointments.
 * @version     :: 1.0
 */

import * as utils from '../utils';
import { type UUID } from 'crypto';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import type { MqttClient } from 'mqtt';
import type Database from 'better-sqlite3';
import { type Statement } from 'better-sqlite3';
import type { Request, Response } from 'express';
import {
  UserType,
  SessionResponse,
  type AsyncResObj,
  type Appointment,
  type WhoisResponse,
  type UserName,
  type PatientSubscription
} from '../types/types';

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
  client.publish(utils.MQTT_PAIRS.whois.req, `${reqId}/${sessionKey}/*`);
  client.subscribe(utils.MQTT_PAIRS.whois.res);

  try {
    const result: WhoisResponse = await utils.whoisByToken(
      reqId.toString(),
      utils.MQTT_PAIRS.whois.res
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

  /**
   * We need to get the name of the dentist, we should not be sharing emails, rather
   * we should be sharing names to patients.
   */
  const dReqId: string = utils.genReqId();
  client.publish(
    utils.MQTT_PAIRS.dname.req,
    `${dReqId}/${appointment.dentistId}/*`
  );

  // Switch the topics
  client.unsubscribe(utils.MQTT_PAIRS.whois.res);
  client.subscribe(utils.MQTT_PAIRS.dname.res);

  let dentistName: UserName;
  try {
    dentistName = await utils.userNameByEmail(dReqId, utils.MQTT_PAIRS.dname.res);
  } catch (err: Error | unknown) {
    return res.status(504).json({
      message: 'Service timeout: unable to get dentist\'s name.'
    });
  }

  const pReqId: string = utils.genReqId();
  client.publish(
    utils.MQTT_PAIRS.pname.req,
    `${pReqId}/${email}/*`
  );

  client.unsubscribe(utils.MQTT_PAIRS.dname.res);

  let patientName: UserName;
  try {
    patientName = await utils.userNameByEmail(pReqId, utils.MQTT_PAIRS.pname.res);
  } catch (err: Error | unknown) {
    return res.status(504).json({
      message: 'Service timeout: unable to get patient\'s name.'
    });
  }

  /**
   * If a patient has unbooked an appointment, then we need to notify all the
   * patients that are subscribed to the dentist.
   * @see PatientSubscription
   */
  if (!toBook) {
    let subscriptions: PatientSubscription[] = [];
    try {
      // The current user who unbooked the appointment should not be notified.
      subscriptions = database.prepare(`
      SELECT patientEmail FROM subscriptions WHERE dentistEmail = ? AND patientEmail != ?
    `).all(appointment.dentistId, email) as PatientSubscription[];
    } catch (err: Error | unknown) {
      return res.status(500).json({ message: 'Internal server error: database error.' });
    }
    try {
      /**
       * Traverse all the subscriptions and publish a notification to each patient.
       */
      subscriptions.forEach((subscription: PatientSubscription) => {
        utils.pubNotification(
          subscription.patientEmail,
          utils.newUnbookedAppointmentMsg(dentistName),
          client as MqttClient
        );
      });
    } catch (err: Error | unknown) {
      return res.status(503).json((err as Error).message);
    }
  }

  /**
   * As the appointment has been booked or canceled right now, we also want to
   * send a notification to the patient that just booked or canceled it.
   * We also need to let the dentist know that their appointment was booked or canceled.
   * TODO: add name, not email.
   */
  const patientMessage = toBook
    ? `Your booking on ${utils.formatDateTime(appointment.start_timestamp)} was confirmed.`
    : `Your booking on ${utils.formatDateTime(appointment.start_timestamp)} was canceled.`;

  const dentistMessage = toBook
    ? `${patientName.firstName} ${patientName.lastName} made a booking with you on ${utils.formatDateTime(appointment.start_timestamp)}`
    : `${patientName.firstName} ${patientName.lastName} canceled their booking with you on ${utils.formatDateTime(appointment.start_timestamp)}`;

  try {
    utils.pubNotification(email, patientMessage, client);
    utils.pubNotification(appointment.dentistId, dentistMessage, client);
  } catch (err) {
    return res.status(503).json((err as Error).message);
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
