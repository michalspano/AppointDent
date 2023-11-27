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

  // Authorise the user that tries to fetch notifications.
  const authRes = await authoriseUser(req, res);
  if (authRes !== undefined) {
    return authRes;
  }

  // Id for the notification that is to be deleted.
  const notId = req.params.id;
  // First we get the the notification from the database to see if it exists.
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
  const delStmt: Statement = database.prepare('DELETE FROM notifications WHERE id = ?');
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

  // Authorise the user that tries to fetch notifications.
  const authRes = await authoriseUser(req, res);
  if (authRes !== undefined) {
    return authRes;
  }

  // The email of the user that wants to delete all of their notifications
  const userEmail = req.params.email;
  // Array of notifications belonging to the user
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

  // User has notifications, process to delete them.
  const delStmt: Statement = database.prepare('DELETE FROM notifications WHERE email = ?');
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

// Wrapper functions to ditch the asynchronicity of using MQTT.
export const deleteAllNotification = function (req: Request, res: Response): void {
  void deleteAsyncAllNotification(req, res);
};

export const deleteNotification = function (req: Request, res: Response): void {
  void deleteAsyncNotification(req, res);
};
