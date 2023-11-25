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
 * @description the session service responds with 0 on a failed session
 * verification, and 1 on a successful session verification. This enum
 * type maps the response to a more readable format.
 */
export enum SessionResponse {
  Fail = 0,
  Success = 1
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
