/**
 * controllers/delete.controller.ts
 *
 * @description :: DELETE methods for appointments.
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
  type WhoisResponse
} from '../types/types';

const { GET, DELETE } = QUERY;

const TOPIC: string = utils.MQTT_PAIRS.whois.req;
const RESPONSE_TOPIC: string = utils.MQTT_PAIRS.whois.res;

/**
 * @description the controller that deletes an appointment. This controller is protected
 * and only a dentist can delete an **own** appointment (i.e., an appointment that they are
 * assigned to). Furthermore, the dentist must be logged in and have a valid session. All
 * other requests shall be rejected.
 *
 * @see whoisByToken
 * @see WhoisResponse
 *
 * @param req the request object
 * @param res the response object
 * @returns Promise that resolves to an asynchronous response JSON-like object.
 */
export const deleteAppointment = async (req: Request, res: Response): AsyncResObj => {
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

  // This way we indicate to the client that the request expects only a dentist.
  const email: string | undefined = req.query.dentistId as string;
  const sessionKey: string | undefined = req.cookies.sessionKey;

  if (sessionKey === undefined || utils.isForbiddenId(email)) {
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
        message: 'Forbidden: only dentists can delete appointments.'
      });
    }
  } catch (err: Error | unknown) {
    return res.status(504).json({ message: 'Service timeout: unable to verify session.' });
  }

  const id: string = req.params.id; // id of the appointment to delete
  let objToDelete: Appointment | undefined;
  try {
    objToDelete = GET.APPOINTMENT_BY_ID.get(id) as Appointment;
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  // Appointment not found.
  if (objToDelete === undefined) {
    return res.status(404).json({ message: 'Not found.' });
  }

  // Ensure that the dentist is deleting an appointment that they are assigned to.
  // That is, the dentist is in the `dentistId` field of the appointment.
  if (objToDelete.dentistId !== email) {
    return res.status(403).json({ message: 'Forbidden: disallowed operation.' });
  }

  // All steps have been completed, proceed with deleting the appointment...
  try {
    DELETE.APPOINTMENT_BY_ID.run(id);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  // As the appointment has been deleted right now, we want to
  // send a notification to the patient (if not null) that had booked the appointment.
  // finally we sent a confirmation notification to the dentist who deleted it
  if (objToDelete.patientId !== null) {
    const patientMessage = `Your appointment on ${utils.formatDateTime(objToDelete.end_timestamp)} was canceled with your dentist. Please book another appointment.`;
    try {
      utils.pubNotification(objToDelete.patientId, patientMessage, client);
    } catch (err) {
      return res.status(503).json((err as Error).message);
    }
  }

  const dentistMessage = `Your appointment on ${utils.formatDateTime(objToDelete.end_timestamp)} was successfully deleted.`;
  try {
    utils.pubNotification(objToDelete.dentistId, dentistMessage, client);
  } catch (err) {
    return res.status(503).json((err as Error).message);
  }

  return res.status(200).json(objToDelete);
};

/**
 * @description wrapper function for the deleteAppointment function
 * that resolves the asynchronous nature of the function being wrapped.
 *
 * @param req the request object
 * @param res the response object
 */
const deleteAppointmentWrapper = (req: Request, res: Response): void => {
  void deleteAppointment(req, res);
};

export default deleteAppointmentWrapper;
