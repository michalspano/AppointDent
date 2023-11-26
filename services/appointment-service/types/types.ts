import type { UUID } from 'crypto';

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
 * @description a custom type that denotes the response type
 * of the session service in terms of the allowed types of users.
 * Similarly as the SessionResponse enum, this type maps the
 * response to a more readable format.
 */
export enum UserType {
  Dentist = 'd',
  Patient = 'p'
};

/**
 * @description the response of the WHOIS topic is an object
 * with two properties: email and type. The email is the email
 * of the user, and the type is the type of the user.
 */
export interface WhoisResponse {
  status: SessionResponse
  email: string | undefined
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
