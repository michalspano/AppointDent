import database from '../db/config';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { type WhoIsRequest } from '../types/types';

/**
 * This function has the responsibility of informing whoever is interested who they are logged in as.
 * Since information is shared at a minimum, a client has to make a request to this endpoint
 * to be able to see who they are logged in as in the system.
 * @param req request
 * @param res response
 * @returns response object
 */
async function whois (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
  try {
    if (req.cookies.sessionKey === undefined) return res.sendStatus(400);
    const { sessionKey } = req.cookies; // Get the session key from the cookies.
    const hash: string = crypto.createHash('sha256').update(sessionKey).digest('hex');

    if (sessionKey === undefined) {
      return res.status(400).json({ message: 'Missing session cookie' });
    }

    if (database === undefined) {
      return res.status(500).json({
        message: 'Internal server error: database connection failed.'
      });
    }

    let result: WhoIsRequest;
    try {
      result = database.prepare('SELECT email,type FROM users WHERE session_hash = ?').get(hash) as WhoIsRequest;
    } catch (err: Error | unknown) {
      return res.status(500).json({
        message: 'Internal server error: fail performing selection.'
      });
    }
    if (result === undefined) return res.sendStatus(400);
    if (result.email === undefined || result.type === undefined) return res.sendStatus(400);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

export function whoisWrapper (req: Request, res: Response): void {
  void whois(req, res);
}
