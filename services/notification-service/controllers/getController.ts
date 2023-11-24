import type { Response, Request } from 'express';
import database from '../db/config';

export const getNotifications = function (req: Request, res: Response): Response<any, Record<string, any>> {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  const userEmail = req.params.email;
  let notifications: unknown[];
  try {
    notifications = database?.prepare('SELECT * FROM notifications WHERE email = ?').all(userEmail);
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  return res.status(200).json(notifications);
};
