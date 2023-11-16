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
