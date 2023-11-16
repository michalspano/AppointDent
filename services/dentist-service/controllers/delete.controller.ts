import type { Request, Response } from 'express';
import database from '../db/config';

export const deleteDentist = (req: Request, res: Response): void => {
  const email = req.params.email;
  if (database === undefined) {
    res.status(500).send('Database undefined');
    return;
  }

  const query = database.prepare('DELETE FROM dentists WHERE email = ?');
  const result = query.run(email);

  if (result.changes === 0) {
    // If no rows were affected, then dentist with the given email was not found
    res.status(404).json({ message: 'Dentist not found' });
    return;
  }

  res.json({ message: 'Dentist deleted successfully' });
};
