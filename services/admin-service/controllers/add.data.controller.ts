import { type AnalyticsData } from '../types/types';
import type { Request, Response } from 'express';
import type Database from 'better-sqlite3';
import { type Statement } from 'better-sqlite3';
import database from '../db/config';

async function addAnalyticsData (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  if (database === undefined) {
    return res.status(500).json({ message: 'Internal server error: database connection failed.' });
  }
  const request = {
    timestamp: Math.round(Date.now() / 1000),
    method: req.body?.method as string,
    path: req.body?.path as string,
    clientHash: req.body?.clientHash as string
  };

  for (const key of Object.keys(request) as Array<keyof typeof request>) {
    if (request[key] === undefined) return res.sendStatus(400);
  }

  const stmt: Statement = database.prepare(`
    INSERT INTO requests
    (timestamp, method, path, clientHash)
    VALUES (?, ?, ?, ?)
  `);
  /* A query can fail because of a bad request (e.g. invalid object),
   * or that something is wrong with the database (an internal server error).
   * TODO: add proper error handling, so that the latter case is appropriately
   * handled with a 500 status code. */
  try {
    const result: Database.RunResult = stmt.run(Object.values(request));
    const updatedRequest: AnalyticsData = {
      id: result.lastInsertRowid.toString(),
      timestamp: Math.round(Date.now() / 1000),
      method: req.body?.method as string,
      path: req.body?.path as string,
      clientHash: req.body?.clientHash as string
    };
    return res.status(201).json(updatedRequest);
  } catch (err: Error | unknown) {
    return res.status(400).json({ message: 'Bad request: invalid analytics object.' });
  }
};

export function addRequest (req: Request, res: Response): void {
  void addAnalyticsData(req, res);
}
