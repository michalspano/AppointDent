/**
 * @description Utility functions for the appointment service.
 */

import { type Appointment } from '../types/types';

/**
 * @description a helper function to convert an unknown object to an
 * Appointment object. This is used when retrieving an appointment from
 * the database (it returns, indeed, an unknown object).
 *
 * @param obj an unknown object
 * @returns Appointment object
 */
export const destructUnknownToAppointment = (obj: unknown): Appointment => {
  const appointment: Appointment = {
    id: (obj as Appointment).id,
    start_timestamp: (obj as Appointment).start_timestamp,
    end_timestamp: (obj as Appointment).end_timestamp,
    dentistId: (obj as Appointment).dentistId,
    patientId: (obj as Appointment).patientId
  };

  return appointment;
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
