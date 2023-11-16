import type * as mqtt from 'mqtt';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

interface AuthenticationRequest {
  reqId: string
  userId: string
  secret: string
};

async function validateRequestFormat (msgArr: string[]): Promise<void> {
  if (!msgArr[msgArr.length - 1].includes('*')) {
    throw Error('Could not find "*" in message! Please double check that you are sending the full data!');
  }
  if (msgArr.length !== 3) {
    throw Error('Invalid format: REQID/USERID/SECRET*');
  }
}
/**
 * Parse a raw MQTT authorisation request
 * @param rawMsg
 * @returns AuthenticationRequest
 * @description Used to parse and validate an auth request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<AuthenticationRequest> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr);
  const request: AuthenticationRequest = {
    reqId: msgArr[0],
    userId: msgArr[1],
    secret: msgArr[2]
  };
  return request;
}

async function authenticateRequest (request: AuthenticationRequest): Promise<boolean> {
  return await new Promise<boolean>((resolve, reject) => {
    try {
      const query: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT expiry FROM sessions WHERE token = ?');
      const result: unknown = query?.get(request.secret);
      if (result === undefined) resolve(false);
      console.log(result);
    } catch (err) {
      try {
        reject(new Error((err as Error).message));
      } catch (err) {
        reject(new Error('Fatal error.'));
      }
    }
  });
}
/**
 * Start authentication listener
 * @param client
 * @description Used for authorising users to the system.
 * expected message format: REQID/USERID/SECRET*
 * REQID: Random unique id that requestor sets to identify an authentication request. Is not stored persistently in a DB.
 * USERID: User id number
 * SECRET: Session secret
 */
export async function listenForAuthorise (client: mqtt.MqttClient): Promise<void> {
  client?.on('message', (topic: string, message: Buffer) => {
    if (topic === TOPIC) {
      parseRawRequest(message.toString()).then((result: AuthenticationRequest) => {
        void authenticateRequest(result);
        client.publish(RESPONSE_TOPIC, `${result.reqId}/1*`); // 1: authorised 0:unauthorised
      }).catch((err) => {
        throw Error(err.message);
      });
    }
  });
  client.subscribe(TOPIC);
  console.log('Authentication Listener Started');
}
