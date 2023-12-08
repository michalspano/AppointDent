import type { Request, Response } from 'express';
import { killedServices } from '../mqtt/heartbeatListener';

export const heartbeatController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  return res.status(200).json({ data: killedServices });
};

export const heartbeatWrapper = (req: Request, res: Response): void => {
  void heartbeatController(req, res);
};
