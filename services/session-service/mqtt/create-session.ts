import type * as mqtt from 'mqtt';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import * as crypto from 'crypto';
import { type User, type CreateSessionRequest } from '../types/types';
import { executeQuery } from '../helper/query';
import { EXPIRE_IN_SECONDS } from '../helper/constants';
import { validateRequestFormat } from '../helper/validator';
import { hashThis } from '../helper/hash';

const TOPIC = 'CREATESESSION';
const RESPONSE_TOPIC = 'SESSION';

/**
 * Parse a raw MQTT session creation request.
 * @param rawMsg
 * @returns CreateSessionRequest
 * @description Used to parse and validate a session creation request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<CreateSessionRequest> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr, 4);
  const request: CreateSessionRequest = {
    reqId: msgArr[0],
    email: msgArr[1],
    password: msgArr[2]
  };
  return request;
}
const sessionQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT * FROM sessions WHERE token = ?');
const user: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT * FROM users WHERE email = ?');

/**
 * Used to create a new session key with an expiry of 1 hour.
 * @param request Received request that wants to create a new session.
 * @returns Secret session key.
 */
async function createNewSession (request: CreateSessionRequest): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    try {
      // Retrieve user information from the database
      const userResult: User = user?.get(request.email) as User;
      if (userResult === undefined) reject(new Error('User undefined.'));

      // Hash the user's provided password and compare it with the stored hash
      hashThis(request.password).then((hash) => {
        if (hash !== userResult.password_hash) reject(new Error('Unmatching hashes'));

        // Generate a unique session token
        let key: string = crypto.randomUUID();
        let keyUnique: boolean = false;
        // Ensure the key is unique
        while (!keyUnique) {
          const session = sessionQuery?.get(key);
          if (session === undefined) keyUnique = true;
          key = crypto.randomUUID();
        }

        // Hash the session token
        hashThis(key).then((hashedKey) => {
        // Calculate the session's expiration time (1 hour from now), this extends the expiry
          const expiry: number = (Math.round(Date.now() / 1000) + EXPIRE_IN_SECONDS);

          // Delete the previous session key
          executeQuery('DELETE FROM sessions WHERE hash = ?', [userResult.session_hash], false, false);
          // Insert new session
          executeQuery('INSERT INTO sessions (hash, token, expiry) VALUES (?, ?, ?)', [hashedKey, key, expiry], true, true);
          // Update the session hash in the users table
          executeQuery('UPDATE users SET session_hash = ? WHERE email = ?', [hashedKey, request.email], true, true);
          resolve(key);
        }).catch((err) => {
          reject(new Error((err as Error).message));
        });
      }).catch((err) => {
        reject(new Error((err as Error).message));
      });
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
 * Start the MQTT session creation listener.
 * @param client MQTT clent to listen for messages.
 * @description Used for creating new sessions in the system.
 * Expected message format: REQID/EMAIL/PASSWORD/*
 * REQID: Random unique id that requestor sets to identify an authentication request. Is not stored persistently in a DB.
 * EMAIL: User's email
 * PASSWORD: User's password in plaintext
 */
export async function listenForSessionCreation (client: mqtt.MqttClient): Promise<void> {
  // Set up a listener for MQTT messages
  client?.on('message', (topic: string, message: Buffer) => {
    // Check if the message is on the CREATESESSION topic
    if (topic === TOPIC) {
      // Parse the raw request, create a new session, and publish the response
      parseRawRequest(message.toString()).then((result: CreateSessionRequest) => {
        createNewSession(result).then((session: string) => {
          // Publish success response
          client.publish(RESPONSE_TOPIC, `${result.reqId}/${session}/*`);
        }).catch((err) => {
          // Publish error response. It is indicated by a 0.
          client.publish(RESPONSE_TOPIC, `${result.reqId}/0/*`);
          console.error(err);
        });
      }).catch((err) => {
        throw Error(err.message);
      });
    }
  });
  // Subscribe client to the CREATESESSION topic
  client.subscribe(TOPIC);
  console.log('Session Creation Listener Started');
}
