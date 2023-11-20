import database from '../db/config';
import type { Request, Response } from 'express';

// Get all appointments slots that are not assigned to a patient.
export const getAllAppointments = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // TODO: ensure that the caller of the request has a valid session.

  let result: unknown[];
  try {
    result = database.prepare('SELECT * FROM appointments WHERE patientId IS NULL').all();
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(result);
};

// Get all appointments slots that are assigned to a patient.
export const getAppointmentsByPatientId = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // TODO: ensure that a valid session is present.
  // Ensure that the caller of the request is the patient that is being queried.
  // Don't allow a patient to query another patient's appointments.

  const patientId: string = req.params.patientId;

  // TODO: make a call to patient-service to ensure that the patient exists.
  // If not, return 404. For now, it is assumed that the patient exists.

  let result: unknown[];
  try {
    result = database.prepare('SELECT * FROM appointments WHERE patientId = ?').all(patientId);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(result);
};

// Get an appointment by id.
export const getAppointment = (req: Request, res: Response): Response<any, Record<string, any>> => {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // TODO: ensure that a valid session is present.

  const id: string = req.params.id;
  let appointment: unknown;
  try {
    appointment = database
      .prepare('SELECT * FROM appointments WHERE id = ?')
      .get(id);
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: query failed.'
    });
  }

  if (appointment === undefined) {
    return res.status(404).json({
      message: `Appointment with id ${id} not found.`
    });
  }

  return res.status(200).json(appointment);
};
