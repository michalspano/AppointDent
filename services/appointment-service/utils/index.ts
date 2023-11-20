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
 * boolean value.
 * 
 * @param toBookParam a raw string representing the query parameter toBook
 * obtained from path of the request. It is set to `any`, because the return
 * of a query parameter has various string-like types.
 * 
 * @returns a boolean value representing the query parameter toBook.
 * @throws an error if the query parameter is not valid.
 */
export const parseToBookQuery = (toBookParam: any): boolean => {
  switch (toBookParam) {
    case undefined:
      return true; // Default value is set to `true`.
    case 'true'.toLowerCase().trim():
      return true;
    case 'false'.toLowerCase().trim():
      return false;
    default:
      throw new Error('Invalid query parameter: toBook must be true or false.');
  }
};