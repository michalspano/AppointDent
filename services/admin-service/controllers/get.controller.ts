import { type AnalyticsData } from '../types/types';
import type { Request, Response } from 'express';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';

// One year
const MAX_INTERVAL_IN_SECONDS = 3600 * 24 * 365;

async function getAnalyticsData (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  if (database === undefined) {
    return res.status(500).json({ message: 'Internal server error: database connection failed.' });
  }
  if (req.params.id === undefined) {
    return res.status(400).json({ message: 'Missing id' });
  }

  /* A query can fail because of a bad request (e.g. invalid object),
   * or that something is wrong with the database (an internal server error).
   * TODO: add proper error handling, so that the latter case is appropriately
   * handled with a 500 status code. */
  let result: AnalyticsData;
  try {
    result = database.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id) as AnalyticsData;
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }
  if (result === undefined) return res.sendStatus(404);
  return res.status(200).json(result);
};

async function getAllAnalyticsData (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  if (database === undefined) {
    return res.status(500).json({ message: 'Internal server error: database connection failed.' });
  }
  if (req.query.start === undefined) return res.status(400).json({ message: 'Start time needs to be set' });
  if (req.query.end === undefined) return res.status(400).json({ message: 'Start time needs to be set' });
  const start = parseInt(req.query.start as string);
  const end = parseInt(req.query.end as string);
  const interval = start - end;
  if (interval > MAX_INTERVAL_IN_SECONDS) return res.status(400).json({ message: 'Interval too large' });

  /* A query can fail because of a bad request (e.g. invalid object),
   * or that something is wrong with the database (an internal server error).
   * TODO: add proper error handling, so that the latter case is appropriately
   * handled with a 500 status code. */
  const stmt: Statement = database.prepare(`
    SELECT * FROM requests WHERE timestamp < ? AND timestamp > ?
  `);
  let result: AnalyticsData[];
  try {
    result = stmt.all(start, end) as AnalyticsData[];
  } catch (err: Error | unknown) {
    return res.status(500).json({
      message: 'Internal server error: fail performing selection.'
    });
  }
  if (result.length === 0) return res.sendStatus(404);
  return res.status(200).json(result);
};

export function getRequest (req: Request, res: Response): void {
  void getAnalyticsData(req, res);
}

export function getAllRequests (req: Request, res: Response): void {
  void getAllAnalyticsData(req, res);
}
