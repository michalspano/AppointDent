import type { Response, Request, NextFunction } from 'express';
import { client } from '../mqtt/mqtt';
import { getAuth } from '../helper/gethAuth';

const REQ_TOPIC = 'AUTHREQ';
const RES_TOPIC = 'AUTHRES';

const authorisAsyncUser = async function (req: Request, res: Response, next: NextFunction): Promise<void> {
  if (client === undefined) {
    res.status(500).json({ message: 'MQTT connection failed' });
    return;
  }

  const { sessionKey } = req.cookies;
  let authRes: string;

  if (sessionKey === undefined) {
    res.sendStatus(401);
    return;
  }

  const reqId = String(Math.round(Math.random() * 1000));
  client?.subscribe(RES_TOPIC);
  client.publish(REQ_TOPIC, `${reqId}/${req.params.email}/${sessionKey}/*`);

  try {
    authRes = await getAuth(client, RES_TOPIC, reqId);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'MQTT connection failed' });
    return;
  }

  if (authRes === '0') {
    res.sendStatus(401);
    return;
  }
  next();
};

export const authoriseUser = function (req: Request, res: Response, next: NextFunction): void {
  void authorisAsyncUser(req, res, next);
};
