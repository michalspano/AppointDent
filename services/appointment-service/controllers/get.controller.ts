/**
 * controllers/get.controller.ts
 *
 * @description :: GET methods for appointments.
 * @version     :: 1.0
 */

import QUERY from '../query';
import database from '../db/config';
import { client } from '../mqtt/mqtt';
import * as utils from '../utils';
import type { Request, Response } from 'express';
import {
  UserType,
  SessionResponse,
  type AsyncResObj,
  type Appointment,
  type WhoisResponse,
  type Subscription,
  type UnixTimestampRange
} from '../types/types';

const { GET } = QUERY;

/**
 * @description A controller function to get all unbooked appointments.
 * This function is encapsulated in a wrapper function to resolve the
 * asynchronous nature of the function being wrapped.
 *
 * This endpoint is protected by the session service. It can only be accessed
 * when the user has a valid session. The session is verified by the session
 * service.
 *
 * Furthermore, there's the possibility to filter the appointments with a date range.
 * Use the `from` and `to` query parameters to filter the appointments. If these are not
 * given, all appointments are returned.
 *
 * @see verifySession
 * @see SessionResponse
 * @see UnixTimestampRange
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
  // Read the [from, to] interval from the query parameters.
  const { from, to }: { from?: string, to?: string } = req.query;

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
    );
    if (result !== SessionResponse.Success) {
      return res.status(401).json({ message: 'Unauthorized: invalid session.' });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({
      message: 'Service timeout: unable to verify session.'
    });
  }

  const interval: UnixTimestampRange = {};
  // If both `from` and `to` not given, then a custom range is not used.
  const hasRange: boolean = from !== undefined && to !== undefined;

  if (hasRange) {
    /**
     * Note to developers: `parseInt` will strop all non-numeric characters.
     * So, if the user passes a string like '123abc', it will be parsed as '123'.
     * This is likely be altered in the future, but for now, this is the intended
     * behavior.
     */
    const fromRaw: number = parseInt(from as string);
    const toRaw: number = parseInt(to as string);

    /**
     * An interval is only valid iff: (i) both `from` and `to` are numbers,
     * (ii) `from` is smaller than `to`. In case that holds, `interval` is
     * populated accordingly.
     */
    if (isNaN(fromRaw) || isNaN(toRaw)) {
      return res.status(400).json({ message: 'Bad request: to and from must be numbers.' });
    } else if (fromRaw > toRaw) {
      return res.status(400).json({ message: 'Bad request: from must be smaller than to.' });
    } else {
      interval.from = fromRaw;
      interval.to = toRaw;
    }
  }

  // Session has been validated, proceed with the request.
  let result: Appointment[];
  try {
    // In case the range is provided, then the query must be prepared with the range.
    // Type `any` is used because the array does not mutate.
    const options: Array<number | undefined> = !hasRange
      ? []
      : [interval.from, interval.to];
    result = GET.UNASSIGNED_APPOINTMENTS(hasRange).all(...options) as Appointment[];
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

  if (sessionKey === undefined || utils.isForbiddenId(email)) {
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
    result = GET.APPOINTMENTS_BY_PATIENT
      .all(email) as Appointment[];
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
 * Furthermore, there's the possibility to filter the appointments with a date range.
 * Use the `from` and `to` query parameters to filter the appointments. If these are not
 * given, all appointments are returned.
 *
 * @see whoisByToken
 * @see WhoisResponse
 * @see UnixTimestampRange
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
  // Read the [from, to] interval from the query parameters.
  const { from, to }: { from?: string, to?: string } = req.query;

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

  const interval: UnixTimestampRange = {};
  // If both `from` and `to` not given, then a custom range is not used.
  const hasRange: boolean = from !== undefined && to !== undefined;

  if (hasRange) {
    /**
     * Note to developers: `parseInt` will strop all non-numeric characters.
     * So, if the user passes a string like '123abc', it will be parsed as '123'.
     * This is likely be altered in the future, but for now, this is the intended
     * behavior.
     */
    const fromRaw: number = parseInt(from as string);
    const toRaw: number = parseInt(to as string);

    /**
     * An interval is only valid iff: (i) both `from` and `to` are numbers,
     * (ii) `from` is smaller than `to`. In case that holds, `interval` is
     * populated accordingly.
     */
    if (isNaN(fromRaw) || isNaN(toRaw)) {
      return res.status(400).json({ message: 'Bad request: to and from must be numbers.' });
    } else if (fromRaw > toRaw) {
      return res.status(400).json({ message: 'Bad request: from must be smaller than to.' });
    } else {
      interval.from = fromRaw;
      interval.to = toRaw;
    }
  }

  let result: Appointment[];
  try {
    /**
     * The query is different based on the following:
     * (i) whether to filter booked appointments or not,
     * (ii) whether to filter by a date range or not.
     *
     * These two flags can be combined and both have default values
     * (i.e., can be omitted).
     * In case the range is provided, then the query must be prepared with the range.
     */
    const options: [string, number?, number?] = !hasRange
      ? [dentistId]
      : [dentistId, interval.from, interval.to];
    result = GET.APPOINTMENTS_BY_DENTIST(
      getOnlyAvailable, hasRange
    ).all(...options) as Appointment[];
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  // All went well, return the retrieved result.
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
    );
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
    appointment = GET.APPOINTMENT_BY_ID.get(id);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  // Resource not found.
  if (appointment === undefined) {
    return res.status(404).json({ message: 'Not found.' });
  }

  return res.status(200).json({ id: (appointment as Appointment).id.toString(), ...appointment });
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
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined) {
    return res.status(400).json({ message: 'Bad request: missing session key.' });
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
    const rawResult = GET.APPOINTMENT_COUNT(getOnlyAvailable)
      .get() as { count: number };
    count = rawResult.count;
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json({ count });
};

/**
 * @description a controller function that is used to get an array of subscription
 * that a particular patient has of a particular dentist. This is, in turn, used
 * to verify if a patient is subscribed to a dentist. This endpoint is protected
 * by the session service. It can only be accessed when the user has a valid session.
 * This endpoint is only accessible by patients.
 *
 * Note: if required, this endpoint can be opened to dentists as well. As of now,
 * such a functionality is not required.
 *
 * @param req the request object
 * @param res the response object
 * @returns Asynchronous response JSON-like object.
 */
const getSubscription = async (req: Request, res: Response): AsyncResObj => {
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

  const dentistEmail: string | undefined = req.params.email;
  const patientEmail: string | undefined = req.params.patientEmail;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  // Ensure that the required parameters are provided.
  if (sessionKey === undefined) {
    return res.status(400).json({ message: 'Bad request: missing session key.' });
  } else if (utils.isForbiddenId(dentistEmail)) {
    return res.status(400).json({ message: 'Bad request: invalid dentist email.' });
  } else if (utils.isForbiddenId(patientEmail)) {
    return res.status(400).json({ message: 'Bad request: invalid patient email.' });
  }

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
      return res.status(403).json({
        message: 'Forbidden: only patients can subscribe to dentists.'
      });
    }

    // Check if the emails match (of the patient and the one in the session).
    // This case also handles when a non-existent email is provided.
    if (result.email !== patientEmail) {
      return res.status(403).json({ message: 'Forbidden: invalid email.' });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({
      message: 'Service timeout: unable to verify session.'
    });
  }

  // Verification step successful, verify the state of the subscription.
  let subscriptions: Subscription[];
  try {
    subscriptions = GET.SUBSCRIPTIONS.all(dentistEmail, patientEmail) as Subscription[];
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(subscriptions);
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

const subscription = (req: Request, res: Response): void => {
  void getSubscription(req, res);
};

// Export the controllers.
export default {
  subscription,
  allAppointments,
  appointment,
  appointmentCount,
  appointmentsByPatientId,
  appointmentsByDentistId
};
