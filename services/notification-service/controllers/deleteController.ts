import type { Response, Request } from 'express';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import { authoriseUser } from './authorisation';

// Delete specific notification
const deleteAsyncNotification = async function (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  const authRes = await authoriseUser(req, res);
  if (authRes !== undefined) {
    return authRes;
  }

  const notId = req.params.id;
  let notToDelete: unknown;

  try {
    notToDelete = database?.prepare('SELECT * FROM notifications WHERE id = ?').get(notId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  if (notToDelete === undefined) {
    return res.status(404).json({
      message: `Notification with id ${notId} was not found.`
    });
  }

  // Notification is found, process to delete it.
  const delStmt: Statement = database.prepare('DELETE FROM appointments WHERE id = ?');
  try {
    delStmt.run(notId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Internal server error: fail performing deletion.'
    });
  }

  // Everything went well, notify the client
  return res.sendStatus(204);
};

// Delete all notifications that belong to a user
const deleteAsyncAllNotification = async function (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  if (database === undefined) {
    return res.status(500).json({
      message: 'Internal server error: database connection failed.'
    });
  }

  const authRes = await authoriseUser(req, res);
  if (authRes !== undefined) {
    return authRes;
  }

  const userEmail = req.params.email;
  let notArray: unknown[];
  try {
    notArray = database.prepare('SELECT * FROM notifications where email = ?').all(userEmail);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }

  if (notArray.length < 1) {
    return res.status(404).json({
      message: `User with email ${userEmail} has no notifications.`
    });
  }

  // User has notifications, process to delete it.
  const delStmt: Statement = database.prepare('DELETE FROM appointments WHERE email = ?');
  try {
    delStmt.run(userEmail);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Internal server error: fail performing deletion.'
    });
  }

  // Everything went well, notify the client
  return res.sendStatus(204);
};

export const deleteAllNotification = function (req: Request, res: Response): void {
  void deleteAsyncAllNotification(req, res);
};

export const deleteNotification = function (req: Request, res: Response): void {
  void deleteAsyncNotification(req, res);
};
