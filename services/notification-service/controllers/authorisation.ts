import type { Response, Request } from 'express';
import { client } from '../mqtt/mqtt';
import { getAuth } from '../helper/gethAuth';

const REQ_TOPIC = 'AUTHREQ';
const RES_TOPIC = 'AUTHRES';

export const authoriseUser = async function (req: Request, res: Response): Promise<undefined | Response<any, Record<string, any>>> {
  if (client === undefined) {
    return res.status(500).json({ message: 'MQTT connection failed' });
  }

  const { sessionKey } = req.cookies;
  let authRes: string;

  if (sessionKey === undefined) {
    return res.status(401).json({ message: 'did not found sessionKey.' });
  }

  const reqId = String(Math.round(Math.random() * 1000));
  client?.subscribe(RES_TOPIC);
  client.publish(REQ_TOPIC, `${reqId}/${req.params.email}/${sessionKey}/*`);
  console.log(req.params.email);

  try {
    authRes = await getAuth(client, RES_TOPIC, reqId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'MQTT connection failed' });
  }

  if (authRes === '0') {
    return res.status(401).json({ message: 'session was wrong.' });
  }
  return undefined;
};
