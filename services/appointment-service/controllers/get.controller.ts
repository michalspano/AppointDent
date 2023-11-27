/**
 * controllers/get.controller.ts
 *
 * @description :: GET methods for appointments.
 * @version     :: 1.0
 */

import database from '../db/config';
import { client } from '../mqtt/mqtt';
import * as utils from '../utils';
import type { Request, Response } from 'express';
import { SessionResponse, type AsyncResObj, UserType, type WhoisResponse, type Appointment } from '../types/types';

/**
 * @description A controller function to get all unbooked appointments.
 * This function is encapsulated in a wrapper function to resolve the
 * asynchronous nature of the function being wrapped.
 *
 * This endpoint is protected by the session service. It can only be accessed
 * when the user has a valid session. The session is verified by the session
 * service.
 *
 * @see verifySession
 * @see SessionResponse
 * @see getAllAppointmentsWrapper
 *
 * @returns Promise that resolves to a response object.
 */
const getAllAppointments = async (req: Request, res: Response): AsyncResObj => {
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

  const email: string | undefined = req.body.email;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined || email === undefined) {
    return res.status(400).json({ message: 'Bad request: missing session key or email.' });
  }

  // To get appointments, the user must be logged in.
  // That means, a valid session must be present.
  const TOPIC: string = utils.MQTT_PAIRS.auth.req;
  const RESPONSE_TOPIC: string = utils.MQTT_PAIRS.auth.res;

  const reqId: string = utils.genReqId();
  client.publish(TOPIC, `${reqId}/${email}/${sessionKey}/*`);
  client.subscribe(RESPONSE_TOPIC);

  try {
    const result: SessionResponse = await utils.verifySession(
      reqId.toString(),
      RESPONSE_TOPIC
    ) as SessionResponse;
    if (result !== SessionResponse.Success) {
      return res.status(401).json({ message: 'Unauthorized: invalid session.' });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({
      message: 'Service timeout: unable to verify session.'
    });
  }

  // Session has been validated, proceed with the request.
  let result: Appointment[];
  try {
    result = database.prepare(`
      SELECT * FROM appointments WHERE patientId IS NULL
    `).all() as Appointment[];
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(result);
};

/**
 *
 * @description a controller that is used to get all appointments assigned to a patient.
 * This route is protected and requires the user to be logged in, be a patient and
 * access only their own appointments.
 *
 * @see whoisByToken
 * @see WhoisResponse
 * @see getAllAppointmentsWrapper
 *
 * @param req the request object.
 * @param res the response object.
 * @returns A promise that resolves to a response object.
 */
const getAppointmentsByPatientId = async (req: Request, res: Response): AsyncResObj => {
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

  const email: string | undefined = req.params.email;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  // 'undefined', 'null' are used for testing purposes.
  // This is because the tests for this endpoint use a query parameter.
  if (sessionKey === undefined || email === undefined || ['undefined', 'null', ''].includes(email.trim())) {
    return res.status(400).json({ message: 'Bad request: missing session key or email.' });
  }

  // Use the `WHOIS` topic to determine the role of the user.
  // This, in turn, determines whether the user has the required privileges.
  const TOPIC: string = utils.MQTT_PAIRS.whois.req;
  const RESPONSE_TOPIC: string = utils.MQTT_PAIRS.whois.res;

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
      return res.status(403).json({ message: 'Forbidden: disallowed operation.' });
    }

    // Prevent any attempts to access appointments of other patients.
    // This, furthermore, detects if the patient exists in the database.
    if (result.email !== email) {
      return res.status(403).json({
        message: 'Forbidden: attempt to access appointments of other or non-existent patient.'
      });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({ message: 'Service timeout: unable to verify session.' });
  }

  // Verification successful, proceed with the request.
  let result: Appointment[];
  try {
    result = database.prepare(`
      SELECT * FROM appointments WHERE patientId = ?
    `).all(email) as Appointment[];
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(result);
};

// Get all appointments slots that are assigned to a dentist (both booked
// and non-booked).
export const getAppointmentsByDentistId = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // TODO: ensure that a valid session is present.
  // This means that the dentist is logged in and exists in the database.
  // Ideally, only the unbooked appointments should be made 'visible'
  // publicly, however, that may be a choice of the dentist. For now,
  // there's no restriction on the visibility of the appointments in
  // this regard.

  const dentistEmail: string = req.params.email;

  let result: unknown[];

  // Read the query parameter to filter only the available appointments.
  // By default, all appointments are returned.
  let getOnlyAvailable: boolean;
  try {
    getOnlyAvailable = utils.parseBinaryQueryParam(req.query.onlyAvailable);
  } catch (err: Error | unknown) {
    return res.status(400).json({
      message: 'Bad request: invalid query parameter.'
    });
  }

  try {
    result = database.prepare(`
      SELECT * FROM appointments WHERE dentistId = ?
      ${getOnlyAvailable ? 'AND patientId IS NULL' : ''}
    `).all(dentistEmail);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(result);
};

// Get an appointment by id.
// The appointment ID has hashed anyway, so only having the valid session
// is enough to ensure that the user is authorized to access the appointment.
// Moral question: what's the probability that a user can guess the appointment
// ID? The answer should be: very low.
export const getAppointment = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // TODO: ensure that a valid session is present.

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

  return res.status(200).json(appointment);
};

/** 
 * @description Wrappers for the controllers.
 * 
 * @example
 * ```
 * import * as GET from 'path/to/get.controller';
 * 
 * GET.allAppointments(req, res); // and the same for the other controllers.
 * ```
 */
export const allAppointments = (req: Request, res: Response): void => {
  void getAllAppointments(req, res);
};

export const appointmentsByPatientId = (req: Request, res: Response): void => {
  void getAppointmentsByPatientId(req, res);
};
