import type { Request, Response } from 'express';
import database from '../db/config';

export const updateDentist = (req: Request, res: Response): void => {
  const email = req.params.email;
  const updatedInfo = req.body;

  if (database === undefined) {
    res.status(500).send('Database undefined');
    return;
  }

  const fieldsToUpdate: string[] = [];
  const values: any[] = [];

  // Build the SET clause dynamically based on the provided fields in updatedInfo
  for (const [key, value] of Object.entries(updatedInfo)) {
    fieldsToUpdate.push(`${key} = ?`);
    values.push(value);
  }

  const query = database.prepare(`
    UPDATE dentists
    SET ${fieldsToUpdate.join(', ')}
    WHERE email = ?
  `);

  try {
    const result = query.run(...values, email);

    if (result.changes === undefined || result.changes === 0) {
      res.status(404).json({ message: 'Dentist not found' });
      return;
    }

    const updatedDentist = { email, ...updatedInfo };
    res.json(updatedDentist);
  } catch (error) {
    console.error('Error updating dentist:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
