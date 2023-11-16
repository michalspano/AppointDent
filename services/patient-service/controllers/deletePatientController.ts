import { type Request, type Response } from 'express';
import database from '../db/config';

export const deletePatientController = (req: Request, res: Response): Response<any, Record<string, any>> => {
  try {
    const email = req.params.email;

    if (database === undefined) {
      sendServerError(res);
      return res.sendStatus(500);
    }

    const query = database.prepare('DELETE FROM patients WHERE email = ?');
    const result = query.run(email);

    if (result.changes === 0) {
      sendNotFound(res, 'Patient not found');
      return res.sendStatus(500);
    }

    return res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    sendServerError(res);
    return res.sendStatus(500);
  }
};

function sendNotFound (res: Response, message: string): Response {
  return res.status(404).json({ message });
}

function sendServerError (res: Response): Response {
  return res.status(500).json({ message: 'Server Error' });
}
