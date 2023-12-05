import type { Request, Response } from 'express';
import { panicMonitor } from '../mqtt/heartbeatListener';

export const heartbeatController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  console.log('heartbeatController', await panicMonitor(500, 10));
  return res.status(200).json({ data: await panicMonitor(500, 10) });
};

export const heartbeatWrapper = (req: Request, res: Response): void => {
  void heartbeatController(req, res);
};
