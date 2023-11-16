import type * as mqtt from 'mqtt';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import * as crypto from 'crypto';
import { type User, type CreateSessionRequest } from '../types/types';
import { executeQuery } from '../helper/query';
import { EXPIRE_IN_SECONDS } from '../helper/constants';
const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';
async function validateRequestFormat (msgArr: string[]): Promise<void> {
  if (!msgArr[msgArr.length - 1].includes('*')) {
    throw Error('Could not find "*" in message! Please double check that you are sending the full data!');
  }
  if (msgArr.length !== 4) {
    throw Error('Invalid format: REQID/EMAIL/PASSWORD/*');
  }
}
/**
 * Parse a raw MQTT authorisation request
 * @param rawMsg
 * @returns AuthenticationRequest
 * @description Used to parse and validate an auth request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<CreateSessionRequest> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr);
  const request: CreateSessionRequest = {
    reqId: msgArr[0],
    email: msgArr[1],
    password: msgArr[2]
  };
  return request;
}

function dumpAll (): void {
  console.log('---');
  const sessionsDump: any = database?.prepare('SELECT * FROM sessions');
  for (const session of sessionsDump.iterate()) {
    console.log(session);
  }
  const userDump: any = database?.prepare('SELECT * FROM users');
  for (const user of userDump.iterate()) {
    console.log(user);
  }
}

/**
 * Used to create a new session key with an expiry of 1 hour.
 * @param request Received request that wants to create a new session
 * @returns Secret session key
 */
async function createNewSession (request: CreateSessionRequest): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    try {
      const user: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT * FROM users WHERE email = ?');
      const userResult: User = user?.get(request.email) as User;
      if (userResult === undefined) reject(new Error('User undefined.'));
      const hash: string = crypto.createHash('sha256').update(request.password).digest('hex');
      if (hash !== userResult.password_hash) reject(new Error('Unmatching hashes'));
      let key: string = crypto.randomUUID();
      let keyUnique: boolean = false;
      while (!keyUnique) {
        const sessionQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT * FROM sessions WHERE token = ?');
        const session = sessionQuery?.get(key);
        if (session === undefined) keyUnique = true;
        key = crypto.randomUUID();
      }
      const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
      const expiry = (Math.round(Date.now() / 1000) + EXPIRE_IN_SECONDS); // Extends the expiration

      executeQuery('DELETE FROM sessions WHERE hash = ?', [userResult.session_hash], false, false); // Delete previous session key
      executeQuery('INSERT INTO sessions (hash, token, expiry) VALUES (?, ?, ?)', [hashedKey, key, expiry], true, true);
      executeQuery('UPDATE users SET session_hash = ? WHERE email = ?', [hashedKey, request.email], true, true);
      resolve(key);
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
 * Start session creation listener
 * @param client
 * @description Used for creating new sessions in the system
 * expected message format: EMAIL/PASSWORD*
 * EMAIL: user email
 * SECRET: Session secret
 */
export async function listenForSessionCreation (client: mqtt.MqttClient): Promise<void> {
  client?.on('message', (topic: string, message: Buffer) => {
    dumpAll();

    if (topic === TOPIC) {
      parseRawRequest(message.toString()).then((result: CreateSessionRequest) => {
        createNewSession(result).then((session: string) => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/${session}/*`);
        }).catch((err) => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/0/*`);
          console.error(err);
        });
      }).catch((err) => {
        throw Error(err.message);
      });
    }
  });
  client.subscribe(TOPIC);
  console.log('Session Creation Listener Started');
}
