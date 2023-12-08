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
 * @see allAppointments
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

  const email: string | undefined = req.query.userId as string;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined || utils.isForbiddenId(email)) {
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
 * @description a controller that is used to get all appointments assigned to a patient.
 * This route is protected and requires the user to be logged in, be a patient and
 * access only their own appointments.
 *
 * @see whoisByToken
 * @see WhoisResponse
 * @see allAppointments
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

/**
 * @description a controller function to get all appointments assigned to a dentist.
 * This endpoint is protected and requires a user to have a valid session. It behaves
 * differently based on the type of the user. If the user is a patient, they can only
 * query the unbooked appointments of a dentist. If the user is a dentist, they can
 * query all appointments of a dentist.
 *
 * The `onlyAvailable` flag is used to filter only the unbooked appointments. By default,
 * only unbooked appointments are returned. However, this flag can fully be utilized by
 * the dentist only. If a patient attempts to use this flag, it is ignored, and only
 * unbooked appointments are returned anyway.
 *
 * @see whoisByToken
 * @see WhoisResponse
 * @see appointmentsByDentistId
 *
 * @param req the request object.
 * @param res the response object.
 * @returns A promise that resolves to a response object.
 */
const getAppointmentsByDentistId = async (req: Request, res: Response): AsyncResObj => {
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

  const dentistId: string | undefined = req.params.email;
  const email: string | undefined = req.query.userId as string;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  // 'undefined', 'null' are used for testing purposes.
  // This is because the tests for this endpoint use a query parameter.
  if (sessionKey === undefined || utils.isForbiddenId(email)) {
    return res.status(400).json({ message: 'Bad request: missing session key or email.' });
  } else if (utils.isForbiddenId(dentistId)) {
    return res.status(400).json({ message: 'Bad request: missing dentist id.' });
  }

  // Use the `WHOIS` topic to determine the role of the user.
  // This, in turn, determines whether the user has the required privileges.
  const TOPIC: string = utils.MQTT_PAIRS.whois.req;
  const RESPONSE_TOPIC: string = utils.MQTT_PAIRS.whois.res;

  let userType: UserType | undefined;
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

    // Store the type of the user for later use.
    userType = result.type as UserType;

    /* Prevent any attempts where emails do not match.
     * This means that session is valid, but a dentist is trying to access
     * appointments of another dentist; patients can bypass this check, because
     * they can only access unbooked appointments of a dentist anyway. */
    if (userType === UserType.Dentist && result.email !== dentistId) {
      return res.status(403).json({ message: 'Forbidden: disallowed operation.' });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({ message: 'Service timeout: unable to verify session.' });
  }

  /* Read the query parameter to filter only the available appointments.
   * By default, only unbooked appointments are returned.
   * Patients can only query the unbooked appointments of a dentist.
   * Therefore the query is different for patients and dentists. */
  let getOnlyAvailable: boolean = true;
  if (userType !== UserType.Patient) {
    try {
      getOnlyAvailable = utils.parseBinaryQueryParam(req.query.onlyAvailable);
    } catch (err: Error | unknown) {
      return res.status(400).json({ message: 'Bad request: invalid query parameter.' });
    }
  }

  let result: Appointment[];
  try {
    result = database.prepare(`
      SELECT * FROM appointments WHERE dentistId = ?
      ${getOnlyAvailable ? 'AND patientId IS NULL' : ''}
    `).all(dentistId) as Appointment[];
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(result);
};

/**
 * @description a controller function that is used to get an appointment by its id.
 * This endpoint is only protected by an active session key. The id of an appointment
 * is hashed and is not visible to the user. Therefore, the user cannot access an
 * appointment that they are not allowed to access (unless they guess the id, which
 * is highly unlikely).
 *
 * @see verifySession
 * @see SessionResponse
 * @see getAppointment
 *
 * @param req The request object.
 * @param res The response object.
 * @returns Promise that resolves to a response object.
 */
const getAppointment = async (req: Request, res: Response): AsyncResObj => {
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

  const email: string | undefined = req.query.userId as string;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined || utils.isForbiddenId(email)) {
    return res.status(400).json({ message: 'Bad request: missing session key or email.' });
  }

  // To get the appointment, the user must be logged in.
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

  // Verification successful, proceed with the request.
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

  // Resource not found.
  if (appointment === undefined) {
    return res.status(404).json({ message: 'Not found.' });
  }

  return res.status(200).json(appointment);
};

/**
 * @description a controller function that is used to get the number of appointments.
 * The `onlyAvailable` flag is used to filter only the unbooked appointments. By default,
 * it gets the count of all appointments.
 * This route is protected and shall only be used by administrators.
 *
 * @see UserType
 * @see whoisByToken
 *
 * @param req the request object.
 * @param res the response object.
 * @returns A promise that resolves to a response object.
 */
const getAppointmentCount = async (req: Request, res: Response): AsyncResObj => {
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

  const email: string | undefined = req.query.adminId as string;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined || utils.isForbiddenId(email)) {
    return res.status(400).json({ message: 'Bad request: missing session key or email.' });
  }

  // Use the `WHOIS` topic to determine the role of the user.
  // This, in turn, determines whether the user has the required privileges.
  // Note: this could perhaps be a stand-alone topic for an admin.
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

    /* Ensure that the user is an admin.
     * There shall only be one account with the Admin type. hence this simple check.
     * TODO: add proper checking (i.e., comparing matching email and type) if there's
     * more admins added to the system. */
    if (result.type !== UserType.Admin) {
      return res.status(403).json({ message: 'Forbidden: missing administrator privileges.' });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({ message: 'Service timeout: unable to verify session.' });
  }

  let getOnlyAvailable: boolean;
  try {
    getOnlyAvailable = utils.parseBinaryQueryParam(req.query.onlyAvailable);
  } catch (err: Error | unknown) {
    return res.status(400).json({ message: 'Bad request: invalid query parameter.' });
  }

  // Verification successful, proceed with the request.
  let count: number;
  try {
    const rawCount: Record<string, number> = database.prepare(`
      SELECT COUNT(*) FROM appointments
      ${getOnlyAvailable ? 'WHERE patientId IS NULL' : ''}
    `).get() as Record<string, number>;
    count = Object.values(rawCount)[0]; // extract the first value (the count)
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json({ count });
};

/**
 * @description Wrappers for the controllers.
 *
 * @example
 * ```
 * import GET from 'path/to/get.controller';
 *
 * GET.allAppointments(req, res); // and the same for the other controllers.
 * ```
 * @note the `GET` object is exported as default, so it can be imported
 * as any name (such as getControllers).
 */
const allAppointments = (req: Request, res: Response): void => {
  void getAllAppointments(req, res);
};

const appointmentsByPatientId = (req: Request, res: Response): void => {
  void getAppointmentsByPatientId(req, res);
};

const appointmentsByDentistId = (req: Request, res: Response): void => {
  void getAppointmentsByDentistId(req, res);
};

const appointment = (req: Request, res: Response): void => {
  void getAppointment(req, res);
};

const appointmentCount = (req: Request, res: Response): void => {
  void getAppointmentCount(req, res);
};

// Export the controllers.
export default {
  allAppointments,
  appointmentsByPatientId,
  appointmentsByDentistId,
  appointment,
  appointmentCount
};
