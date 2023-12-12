/**
 * types/types.ts
 *
 * @description :: Custom types for the appointment service.
 * @version     :: 1.0
 */

import type { UUID } from 'crypto';
import type { Response } from 'express';

/**
 * @description the interface for the appointment object.
 * The id is a UUID (Universally Unique Identifier) and is
 * generated using the crypto module.
 */
export interface Appointment {
  id: UUID
  start_timestamp: number
  end_timestamp: number
  dentistId: UUID
  patientId: UUID | null
};

/**
 * @description a custom type that denotes the relational table
 * when a subscription is made between a patient and a dentist.
 */
export interface Subscription {
  dentistEmail: string
  patientEmail: string
};

/**
 * @description a custom type that resolves a partial Subscription
 * type with the patientId property being given.
 * Set the type of patientId to string.
 */
export type PatientSubscription = Partial<Subscription> & { patientEmail: string };

/**
 * @description a custom type that denotes the response type
 * of the session service in terms of the allowed types of users.
 * Similarly as the SessionResponse enum, this type maps the
 * response to a more readable format.
 */
export enum UserType {
  Dentist = 'd',
  Patient = 'p',
  Admin = 'a'
};

/**
 * @description the response of the WHOIS topic is an object
 * with two properties: email and type. The email is the email
 * of the user, and the type is the type of the user.
 */
export interface WhoisResponse {
  status: SessionResponse
  email: string | undefined
  // the same as: email?: string (documented for clarity)
  type: UserType | undefined
};

/**
 * @description the session service responds with 0 on failed requests
 * and with 1 on successful requests.
 */
export enum SessionResponse {
  Fail = 0,
  Success = 1
};

/**
 * @description the response from the controllers in a Promise
 * like format that resolves to a Response object. A Response
 * object is an object that is returned by the express framework
 * when a request is made to the server. It is similar to a JSON
 * object, but it has more properties.
 *
 * @see https://expressjs.com/en/api.html#res
 */
export type AsyncResObj = Promise<Response<any, Record<string, any>>>;

/**
 * @description a time range: [from, to] in the from of two Unix
 * timestamps, therefore type number and NOT Date.
 */
export interface UnixTimestampRange { from?: number, to?: number };

/**
 * @description a custom type that denotes the response type
 * when a dentist is queried by their email.
 */
export interface DentistName {
  firstName: string
  lastName: string
}
