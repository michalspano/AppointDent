/**
 * controllers/subscribe.controller.ts
 *
 * @description :: HTTP methods to manage subscriptions.
 * @version     :: 1.0
 */

import QUERY from '../query';
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

const { GET, POST, DELETE } = QUERY;

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
  const subscription: Subscription = { dentistEmail, patientEmail };

  try {
    /**
     * Check if the subscription already exists. The user can mistakenly click on the
     * button multiple times, so we need to check if the subscription already exists,
     * so that the database is not filled with duplicate entries, and hence negatively
     * affecting the performance.
     */
    const result: Subscription = GET.SUBSCRIPTIONS.get(
      dentistEmail, patientEmail
    ) as Subscription;

    if (result !== undefined) {
      return res.status(409).json({ message: 'Conflict: subscription already exists.' });
    }

    // Proceed with the creation iff the subscription does not exist.
    POST.SUBSCRIPTION.run(subscription.dentistEmail, subscription.patientEmail);
  } catch (error: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: database error.'
    });
  }

  return res.status(201).json(subscription);
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
    DELETE.SUBSCRIPTION_BY_IDS.run(dentistEmail, patientEmail);
  } catch (error: Error | unknown) {
    return res.status(500).json({ message: 'Internal server error: database error.' });
  }

  return res.sendStatus(204);
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
