import database from '../db/config';
import * as crypto from 'crypto';
import type * as mqtt from 'mqtt';

const TOPIC = 'INSERTUSER';

interface User {
  email: string
  password: string
};
interface InsertionResult {
  changes: number
  lastInsertRowid: number
}
/**
 * Insert user into database
 * @param user the user you want to insert
 * @returns success state of the operation
 */
export async function insertUser (user: User): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    try {
      const insertQuery = database?.prepare('INSERT INTO users (email, hash) VALUES (?, ?)');
      if (insertQuery === undefined) reject(new Error('Query is undefined.'));
      const hash: string = crypto.createHash('sha256').update(user.password).digest('hex');
      const result: InsertionResult = insertQuery?.run(user.email, hash) as InsertionResult;
      if (result.changes === 0) reject(new Error('No changes made.'));
      console.log('added user');
      resolve();
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
 * Parse a raw MQTT authorisation request
 * @param rawMsg
 * @returns AuthenticationRequest
 * @description Used to parse and validate an auth request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<User> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr);
  const request: User = {
    email: msgArr[0],
    password: msgArr[1]
  };
  return request;
}

/**
 * Start authentication listener
 * @param client
 * @description Used for authorising users to the system.
 * expected message format: EMAIL/PASSWORD*
 * REQID: Random unique id that requestor sets to identify an authentication request. Is not stored persistently in a DB.
 * USERID: User id number
 * SECRET: Session secret
 */
export async function listenForInsertion (client: mqtt.MqttClient): Promise<void> {
  client?.on('message', (topic: string, message: Buffer) => {
    if (topic === TOPIC) {
      parseRawRequest(message.toString()).then((result: User) => {
        insertUser(result).catch((err) => {
          console.error(err);
        });
      }).catch((err) => {
        console.error(err);
      });
    }
  });
  client.subscribe(TOPIC);
  console.log('Insertion Listener Started');
}

async function validateRequestFormat (msgArr: string[]): Promise<void> {
  if (!msgArr[msgArr.length - 1].includes('*')) {
    throw Error('Could not find "*" in message! Please double check that you are sending the full data!');
  }
  if (msgArr.length !== 2) {
    throw Error('Invalid format: EMAIL/PASSWORD*');
  }
}
