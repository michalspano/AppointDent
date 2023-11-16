import type * as mqtt from 'mqtt';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import { type AuthenticationRequest, type Session, type User } from '../types/types';
import { executeQuery } from '../helper/query';
import { EXPIRE_IN_SECONDS } from '../helper/constants';
const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

async function validateRequestFormat (msgArr: string[]): Promise<void> {
  if (!msgArr[msgArr.length - 1].includes('*')) {
    throw Error('Could not find "*" in message! Please double check that you are sending the full data!');
  }
  if (msgArr.length !== 4) {
    throw Error('Invalid format: REQID/USERID/SECRET/*');
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
    email: msgArr[1],
    session_key: msgArr[2]
  };
  return request;
}

async function authenticateRequest (request: AuthenticationRequest): Promise<boolean> {
  return await new Promise<boolean>((resolve, reject) => {
    try {
      const userQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT session_hash FROM users WHERE email = ?');
      const userResult: User = userQuery?.get(request.email) as User;
      console.log(userResult);
      if (userResult === undefined) resolve(false);
      const sessionQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT expiry FROM sessions WHERE hash = ?');
      const sessionResult: unknown = sessionQuery?.get(userResult.session_hash);
      const timestamp = Math.round(Date.now() / 1000);
      console.log(sessionResult);

      if (sessionResult === undefined || (sessionResult as Session).expiry < timestamp) resolve(false);
      console.log(request);
      executeQuery('UPDATE sessions SET expiry = ? WHERE token = ?', [(timestamp + EXPIRE_IN_SECONDS), request.session_key], true, true);
      resolve(true);
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
        authenticateRequest(result).then((authResult) => {
          // 1: authorised 0:unauthorised
          console.log(authResult);
          if (!authResult) return client.publish(RESPONSE_TOPIC, `${result.reqId}/0*`);
          client.publish(RESPONSE_TOPIC, `${result.reqId}/1*`);
        }).catch((err) => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/0*`);
          console.error(err);
        });
      }).catch((err) => {
        throw Error(err.message);
      });
    }
  });
  client.subscribe(TOPIC);
  console.log('Authentication Listener Started');
}
