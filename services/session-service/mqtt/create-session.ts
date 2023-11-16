import type * as mqtt from 'mqtt';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import * as crypto from 'crypto';
const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';

interface CreateSessionRequest {
  email: string
  password: string
};
interface User {
  email: string
  hash: string
};
interface Session {
  hash: string
  token: string
  expiry: number
};

async function validateRequestFormat (msgArr: string[]): Promise<void> {
  if (!msgArr[msgArr.length - 1].includes('*')) {
    throw Error('Could not find "*" in message! Please double check that you are sending the full data!');
  }
  if (msgArr.length !== 2) {
    throw Error('Invalid format: EMAIL/PASSWORD*');
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
    email: msgArr[0],
    password: msgArr[1]
  };
  return request;
}

async function createNewSession (request: CreateSessionRequest): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    try {
      const user: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT * FROM users WHERE email = ?');
      const userResult: User = user?.get(request.email) as User;
      if (userResult === undefined)reject(new Error('User undefined.'));
      const hash: string = crypto.createHash('sha256').update(request.password).digest('hex');
      if (hash !== userResult.hash)reject(new Error('Unmatching hashes'));
      let key: string = crypto.randomUUID();
      let keyUnique: boolean = false;
      while (!keyUnique) {
        const sessionQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT * FROM sessions WHERE token = ?');
        const session = sessionQuery?.get(key);
        if (session === undefined) keyUnique = true;
        key = crypto.randomUUID();
      }
      const session: Session = {
        hash: crypto.createHash('sha256').update(key).digest('hex'),
        token: key,
        expiry: (Math.round(Date.now() / 1000) + 3600)

      };

      const insertQuery = database?.prepare('INSERT INTO sessions (hash, token, expiry) VALUES (?, ?, ?)');
      console.log(...session as unknown as []);
      const insertResult = insertQuery?.run(...session as unknown as []);
      console.log(insertResult);
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
export async function listenForSessionCreation (client: mqtt.MqttClient): Promise<void> {
  client?.on('message', (topic: string, message: Buffer) => {
    if (topic === TOPIC) {
      parseRawRequest(message.toString()).then((result: CreateSessionRequest) => {
        createNewSession(result).then((result: string) => {
          client.publish(RESPONSE_TOPIC, `${result}/*`);
        }).catch((err) => {
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
