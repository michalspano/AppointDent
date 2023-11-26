import type { Response, Request } from 'express';
import database from '../db/config';
import { authoriseUser } from './authorisation';

const getAsyncNotifications = async function (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  // Authorise the user that tries to fetch notifications.
  const authRes = await authoriseUser(req, res);
  if (authRes !== undefined) {
    return authRes;
  }

  // The email of the user that wants to fetch all of their notifications
  const userEmail = req.params.email;
  // Array of notifications. If the user has no notifications an empty array is sent (in JSON format).
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

export const getNotifications = function (req: Request, res: Response): void {
  void getAsyncNotifications(req, res);
};
