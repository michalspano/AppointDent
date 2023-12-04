import type { Request, Response } from 'express';
import { listenForHeartbeat } from '../mqtt/heartbeatListener';
import { client } from '../mqtt/mqtt';

let services: string[];
export const servicesRegistry = (servicesList: string[]): void => {
  services = servicesList;
};

export const heartbeatController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  if (client != null) void listenForHeartbeat(services, client, 10);
  return res.status(200).json({ message: 'Success!!!' });
};

export const heartbeatWrapper = (req: Request, res: Response): void => {
  void heartbeatController(req, res);
};
