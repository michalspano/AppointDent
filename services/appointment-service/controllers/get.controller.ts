import database from '../db/config';
import { client } from '../mqtt/mqtt';
import * as utils from '../utils';
import type { Request, Response } from 'express';
import { SessionResponse } from '../types/types';

const TOPIC: string = 'AUTHREQ';
const RESPONSE_TOPIC: string = 'AUTHRES';

/**
 * @description A controller function to get all appointments.
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
const getAllAppointments = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
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
  let result: unknown[];
  try {
    result = database.prepare('SELECT * FROM appointments WHERE patientId IS NULL').all();
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(result);
};

/**
 * @description A wrapper function for getAllAppointments to resolve the
 * asynchronous nature of the function being wrapped.
 *
 * @param req A request object.
 * @param res A response object.
 *
 * @see getAllAppointments
 */
export const getAllAppointmentsWrapper = (req: Request, res: Response): void => {
  void getAllAppointments(req, res);
};

// Get all appointments slots that are assigned to a patient.
export const getAppointmentsByPatientId = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // TODO: ensure that a valid session is present.
  // Ensure that the caller of the request is the patient that is being queried.
  // Don't allow a patient to query another patient's appointments.

  const patientEmail: string = req.params.email;

  // TODO: make a call to patient-service to ensure that the patient exists.
  // If not, return 404. For now, it is assumed that the patient exists.

  let result: unknown[];
  try {
    result = database.prepare('SELECT * FROM appointments WHERE patientId = ?').all(patientEmail);
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
  // Ideally, only the unbooked appointments should be made 'visible'
  // publicly, however, that may be a choice of the dentist. For now,
  // there's no restriction on the visibility of the appointments in
  // this regard.

  const dentistEmail: string = req.params.email;

  // TODO: make a call to the patient-service to ensure that the dentist exists.
  // If not, return 404. For now, it is assumed that the patient exists.

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
