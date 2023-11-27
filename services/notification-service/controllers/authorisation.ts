import type { Response, Request } from 'express';
import { client } from '../mqtt/mqtt';
import { getAuth } from '../helper/gethAuth';

// Topic for requesting authorisation response from session-service.
const REQ_TOPIC = 'AUTHREQ';
// Topic to receive autorisation response from session-service
const RES_TOPIC = 'AUTHRES';
/**
 * @description This method returns a response (which means that the request was either unauthorised
 * or the server crashed due failed MQTT connection failure) to a request made, or undefined which
 * means that the request was authorised.
 * @param req Client request
 * @param res Server response
 * @returns A 'Response' object (server crash or unauthorised access) or undefined (authorised access)
 */
export const authoriseUser = async function (req: Request, res: Response): Promise<undefined | Response<any, Record<string, any>>> {
  if (client === undefined) {
    return res.status(500).json({ message: 'MQTT connection failed' });
  }

  // Client's session is sent using cookies and is called sessionKey.
  const { sessionKey } = req.cookies;
  let authRes: string;

  if (sessionKey === undefined) {
    return res.status(401).json({ message: 'did not find sessionKey.' });
  }

  // We make use of an id to only handle response messages that have this Id
  // Session-service sends a response with the same Id that it received it.
  // In this way, the notification-service does not care about other responses that are meant for
  // other services.
  const reqId = String(Math.round(Math.random() * 1000)); // random id between 0 and 999
  client?.subscribe(RES_TOPIC);
  client.publish(REQ_TOPIC, `${reqId}/${req.params.email}/${sessionKey}/*`);

  try {
    authRes = await getAuth(client, RES_TOPIC, reqId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'MQTT connection failed' });
  }

  // 0 indicates unauthorised access.
  if (authRes === '0') {
    return res.status(401).json({ message: 'session was wrong.' });
  }
  return undefined;
};
