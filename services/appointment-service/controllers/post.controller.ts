/**
 * controllers/post.controller.ts
 *
 * @description :: POST method for appointments.
 * @version     :: 1.0
 */

import { randomUUID } from 'crypto';
import { client } from '../mqtt/mqtt';
import * as utils from '../utils';
import QUERY from '../utils/query';
import database from '../db/config';
import type { Request, Response } from 'express';
import {
  UserType,
  SessionResponse,
  type AsyncResObj,
  type Appointment,
  type UserName,
  type WhoisResponse,
  type PatientSubscription
} from '../types/types';
import { type MqttClient } from 'mqtt/*';

const { GET, POST } = QUERY;

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

    // Restrict access to dentists only.
    if (result.type !== UserType.Dentist) {
      return res.status(403).json({
        message: 'Forbidden: only dentists can create appointments.'
      });
    }

    /* This means that a dentist is trying to create an appointment for another dentist.
     * This sort of behavior is not allowed. */
    if (result.email !== email) {
      return res.status(403).json({
        message: 'Forbidden: attempt to create an appointment for another or non-existent dentist account.'
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

  /* A query can fail because of a bad request (e.g. invalid object),
   * or that something is wrong with the database (an internal server error).
   * TODO: add proper error handling, so that the latter case is appropriately
   * handled with a 500 status code. */
  try {
    POST.APPOINTMENT.run(
      appointment.id,
      appointment.start_timestamp,
      appointment.end_timestamp,
      appointment.dentistId,
      appointment.patientId
    );
  } catch (err: Error | unknown) {
    return res.status(400).json({ message: 'Bad request: invalid appointment object.' });
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

  /**
   * Check for all patients that are subscribed to the dentist. If there are any,
   * publish a notification to them. Herein, we store only the patient's email
   * in the array, the object with the dentist's email is not needed, we have
   * the access to it with the `email` variable.
   *
   * @see PatientSubscription
   */
  let subscriptions: PatientSubscription[] = [];
  try {
    subscriptions = GET.SUBSCRIPTIONS_BY_DENTIST.all(email) as PatientSubscription[];
  } catch (err: Error | unknown) {
    return res.status(500).json({ message: 'Internal server error: database error.' });
  }

  try {
    // Traverse all the subscriptions and publish a notification to each patient.
    subscriptions.forEach((subscription: PatientSubscription) => {
      utils.pubNotification(
        subscription.patientEmail,
        utils.newAppointmentMsg(dentistName),
        client as MqttClient
      );
    });
  } catch (err: Error | unknown) {
    return res.status(503).json((err as Error).message);
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
