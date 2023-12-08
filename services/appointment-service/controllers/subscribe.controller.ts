import database from '../db/config';
import * as utils from '../utils';
import { client } from '../mqtt/mqtt';
import type { Request, Response } from 'express';
import {
  UserType,
  SessionResponse,
  type AsyncResObj,
  type Subscription,
  type WhoisResponse
} from '../types/types';

const TOPIC: string = utils.MQTT_PAIRS.whois.req;
const RESPONSE_TOPIC: string = utils.MQTT_PAIRS.whois.res;

/**
 *
 * @description a helper controller that is used to create a subscription
 * of a particular patient to a desired dentist. The subscription is
 * created by inserting a new row in the `subscriptions` table.
 *
 * This endpoint is protected and assumes a valid session key is provided.
 *
 * @see utils.whoisByToken
 * @see WhoisResponse
 * @see utils.genReqId
 *
 * @param req the request object
 * @param res the response object
 */
const subToDentist = async (req: Request, res: Response): AsyncResObj => {
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
        message:
        'Forbidden: only patients can subscribe to dentists.'
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

  // Verification step successful, create a subscription entry.
  const subscription: Subscription = {
    dentistId: dentistEmail,
    patientId: patientEmail
  };

  try {
    /**
     * Assuming that the ids are unique, we don't have to check for the
     * number of changes. Similarly, existing entries are not checked,
     * because a patient can resubscribe to a dentist. */
    database.prepare('INSERT INTO subscriptions VALUES (?, ?)').run(
      Object.values(subscription)
    );
  } catch (error: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: database error.'
    });
  }

  return res.status(200).json(subscription);
};

/**
 * @description a helper controller that is used to delete a subscription
 * of a particular patient to a desired dentist.
 * This endpoint is protected and assumes a valid session key is provided.
 *
 * @see utils.whoisByToken
 * @see WhoisResponse
 * @see utils.genReqId
 *
 * @param req the request object
 * @param res the response object
 */
const unsubFromDentist = async (req: Request, res: Response): AsyncResObj => {
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
        message: 'Forbidden: only patients can unsubscribe from dentists.'
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

  // Verification step successful, delete the subscription entry.
  try {
    database.prepare('DELETE FROM subscriptions WHERE dentistId = ? AND patientId = ?').run(
      dentistEmail, patientEmail
    );
  } catch (error: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: database error.'
    });
  }

  return res.status(204);
};

/**
 * @description a wrapper function that resolves the promise returned
 * by the `subToDentist` function.
 *
 * @see subToDentist
 */
const subToDentistWrapper = (req: Request, res: Response): void => {
  void subToDentist(req, res);
};

/**
 * @description a wrapper function that resolves the promise returned
 * by the `unsubFromDentist` function.
 *
 * @see unsubFromDentist
 */
const unsubFromDentistWrapper = (req: Request, res: Response): void => {
  void unsubFromDentist(req, res);
};

// Export and remap for naming consistency.
export {
  subToDentistWrapper as subToDentist,
  unsubFromDentistWrapper as unsubFromDentist
};
