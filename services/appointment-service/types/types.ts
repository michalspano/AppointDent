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
 */
export enum UserType {
  Dentist = 'd',
  Patient = 'p'
};
