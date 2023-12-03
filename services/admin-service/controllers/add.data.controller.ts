import { type AnalyticsData } from '../types/types';
import type { Request, Response } from 'express';
import { type Statement } from 'better-sqlite3';
import database from '../db/config';
import * as crypto from 'crypto';

async function addAnalyticsData (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  if (database === undefined) {
    return res.status(500).json({ message: 'Internal server error: database connection failed.' });
  }
  const request: AnalyticsData = {
    id: crypto.randomUUID(),
    timestamp: Math.round(Date.now() / 1000),
    method: req.body?.method,
    path: req.body?.path,
    agent: req.body?.agent,
    clientHash: req.body?.clientHash
  };

  for (const key in request) {
    if (request[key] === undefined) return res.sendStatus(400);
  }

  const stmt: Statement = database.prepare(`
    INSERT INTO requests
    (id, timestamp, method, path, agent, clientHash)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  /* A query can fail because of a bad request (e.g. invalid object),
   * or that something is wrong with the database (an internal server error).
   * TODO: add proper error handling, so that the latter case is appropriately
   * handled with a 500 status code. */
  try {
    stmt.run(Object.values(request));
    console.log('Analytics object created');
  } catch (err: Error | unknown) {
    return res.status(400).json({ message: 'Bad request: invalid analytics object.' });
  }
  return res.status(201).json(request);
};

export function addRequest (req: Request, res: Response): void {
  void addAnalyticsData(req, res);
}
