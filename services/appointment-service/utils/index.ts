/**
 * utils/index.ts
 *
 * @description :: Utility functions for the appointment service.
 * @version     :: 1.0
 */

import { client } from '../mqtt/mqtt';
import { randomBytes } from 'crypto';
import {
  type UserType,
  SessionResponse,
  type WhoisResponse,
  type UserName
} from '../types/types';
import type { MqttClient } from 'mqtt/*';

/**
 * @description the default timeout for the MQTT client to wait for a response.
 */
const TIMEOUT: number = 10000;

/**
 * @description an immutable object that contains the MQTT topics
 * used by the appointment service, mapped to a human-readable
 * key.
 */
export const MQTT_PAIRS: Readonly<Record<string, Record<string, string>>> = Object.freeze({
  auth: {
    req: 'AUTHREQ',
    res: 'AUTHRES'
  },
  whois: {
    req: 'WHOIS',
    res: 'WHOISRES'
  },
  dname: {
    req: 'DENNAME',
    res: 'DENNAMERES'
  },
  pname: {
    req: 'PANAME',
    res: 'PANAMERES'
  }
});

/**
 * @description a helper function that generates a notification message
 * for a patient when an appointment is created.
 *
 * @see controllers/post.controller.ts
 *
 * @param dName the name of a dentist (first and last name)
 * @returns a formatted string that represents a notification message.
 */
export const newAppointmentMsg = (dName: UserName): string => {
  return `Dentist ${dName.firstName} ${dName.lastName} has created a new appointment slot.`;
};

/**
 * @description a helper function that generates a notification message
 * for a patient when an appointment is unbooked.
 *
 * @param dName the name of a dentist (first and last name)
 * @returns a formatted string that represents a notification message.
 */
export const newUnbookedAppointmentMsg = (dName: UserName): string => {
  return `Someone has unbooked an appointment with dentist ${dName.firstName} ${dName.lastName}.` +
          ' The slot is now available.';
};

/**
 * @description a helper function to convert the raw query parameter into a
 * boolean value. If the query parameter is not valid, an error is thrown.
 * It it's simply not given, assign the default value `true`.
 *
 * @param rawParam a raw string representing the 'raw' query parameter
 * obtained from path of the request. It is set to `any`, because the return
 * of a query parameter has various string-like types (for the sake of simplicity,
 * it is set to `any`).
 *
 * @param fallbackValue a fallback value to be used if the query parameter is
 * not given.
 * @default fallbackValue false
 *
 * @returns a boolean value representing the query parameter.
 * @throws an error if the query parameter is not valid.
 */
export const parseBinaryQueryParam = (rawParam: any, fallbackValue: boolean = false): boolean => {
  switch (rawParam) {
    case undefined:
      return fallbackValue;
    case 'true'.toLowerCase().trim():
      return true;
    case 'false'.toLowerCase().trim():
      return false;
    default:
      throw new Error('Invalid query parameter: expected true, false of none.');
  }
};

/**
 * @description helper function that verifies the session of a user based
 * on the session-service.
 *
 * @param reqId the request Id; @see genReqId
 * @param RESPONSE_TOPIC the response topic to subscribe to
 * @returns a promise that resolves to the response of the session-service
 * based on the request Id.
 */
export const verifySession = async (reqId: string, RESPONSE_TOPIC: string): Promise<SessionResponse> => {
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client?.unsubscribe(RESPONSE_TOPIC);
      reject(new Error('MQTT timeout'));
    }, TIMEOUT);

    const eventHandler = (topic: string, message: Buffer): void => {
      if (topic === RESPONSE_TOPIC) {
        if (message.toString().startsWith(`${reqId}/`)) {
          clearTimeout(timeout);
          client?.unsubscribe(topic);
          client?.removeListener('message', eventHandler);

          // Convert to enum type SessionResponse.
          const rawMsg: string = message.toString().split('/')[1];
          resolve(parseInt(rawMsg) as SessionResponse);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
};

/**
 * @description helper function that retrieves the name of a dentist/patient
 * based on their email.
 *
 * @param reqId a randomly computed identifier for the request
 * @param RESPONSE_TOPIC a response topic to subscribe to
 * @returns a promise that resolves to the name of a dentist/patient
 */
export const userNameByEmail = async (reqId: string, RESPONSE_TOPIC: string): Promise<UserName> => {
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client?.unsubscribe(RESPONSE_TOPIC);
      reject(new Error('MQTT timeout'));
    }, TIMEOUT);

    const eventHandler = (topic: string, message: Buffer): void => {
      console.log(topic, message.toString());
      if (topic === RESPONSE_TOPIC) {
        if (message.toString().startsWith(`${reqId}/`)) {
          clearTimeout(timeout);
          client?.unsubscribe(topic);
          client?.removeListener('message', eventHandler);

          const rawMsg: string[] = message.toString().split('/');
          // Signifies that the dentist was not found.
          if (rawMsg[1] === '0') reject(new Error('Dentist not found.'));

          const names: string[] = rawMsg[1].split(',');
          const dName: UserName = {
            firstName: names[0],
            lastName: names[1]
          };
          resolve(dName);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
};

/**
 * @description helper function that retrieves the email and type of a user
 * based on the session-service with the status of the session.
 *
 * @param reqId the request Id; @see genReqId
 * @param RESPONSE_TOPIC the response topic to subscribe to
 *
 * @returns a promise that resolves the response of the WHOIS topic
 * @see WhoisResponse (types/types.ts)
 * @see UserType (types/types.ts)
 * @see SessionResponse (types/types.ts)
 */
export const whoisByToken = async (reqId: string, RESPONSE_TOPIC: string): Promise<WhoisResponse> => {
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client?.unsubscribe(RESPONSE_TOPIC);
      reject(new Error('MQTT timeout'));
    }, TIMEOUT);

    const eventHandler = (topic: string, message: Buffer): void => {
      if (topic === RESPONSE_TOPIC) {
        if (message.toString().startsWith(`${reqId}/`)) {
          clearTimeout(timeout);
          client?.unsubscribe(topic);
          client?.removeListener('message', eventHandler);

          const rawMsg: string[] = message.toString().split('/');

          /* Successful response looks like this:
           * -> REQID/EMAIL/TYPE/*
           * Unsuccessful response looks like this:
           * -> REQ/0/* */
          const email: string = rawMsg[1];

          if (email === '0') {
            resolve({
              status: SessionResponse.Fail,
              email: undefined,
              type: undefined
            });
          }
          resolve({
            status: SessionResponse.Success,
            email,
            type: rawMsg[2] as UserType
          });
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
};

/**
 * @description helper function to generate the ReqId value.
 *
 * @param n the number of bytes to generate
 * @default n 64
 *
 * @returns string of random bytes (hex)
 */
export const genReqId = (n: number = 64): string => {
  return randomBytes(n).toString('hex');
};

/**
 * @description an enumeration of keywords that are forbidden as
 * user identifiers.
 */
enum ForbiddenIds {
  TEST, UNDEFINED, NULL, EMPTY
  // add more...
};

/**
 * @description helper function that detects whether an id is forbidden.
 *
 * @param id the id to check
 * @returns a boolean value
 */
export const isForbiddenId = (id?: string): boolean => {
  if (id === undefined) return true;
  return Object.values(ForbiddenIds).includes(id.toUpperCase().trim()) || id === '';
};

/**
 * @description helper function that publishes a notification to a user
 * based on their email.
 *
 * @see MqttClient
 *
 * @param email an identifier of a user
 * @param message a message to be delivered
 * @param client an instance of an MQTT client
 */
export const pubNotification = (email: string, message: string, client: MqttClient): void => {
  const payload: string = `${email}/${message}/*`;
  try {
    client.publish('NOTREQ', payload);
  } catch (err: Error | unknown) {
    console.log(err);
    throw new Error('Error while publishing notification.');
  }
};

/**
 * @param timestamp a UNIX timestamp in milliseconds.
 * @returns a formatted string representing the date and time.
 */
export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('sv-SE');
};
