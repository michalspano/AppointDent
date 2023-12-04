import type * as mqtt from 'mqtt';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import { type AuthenticationRequest, type Session, type User } from '../types/types';
import { executeQuery } from '../helper/query';
import { EXPIRE_IN_SECONDS } from '../helper/constants';
import { validateRequestFormat } from '../helper/validator';
import { hashThis } from '../helper/hash';

const TOPIC = 'AUTHREQ';
const RESPONSE_TOPIC = 'AUTHRES';

/**
 * Parse a raw MQTT authorisation request
 * @param rawMsg
 * @returns AuthenticationRequest
 * @description Used to parse and validate an auth request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<AuthenticationRequest> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr, 4);
  const request: AuthenticationRequest = {
    reqId: msgArr[0],
    email: msgArr[1],
    session_key: msgArr[2]
  };
  return request;
}

const userQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT session_hash FROM users WHERE email = ?');
const sessionQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT expiry FROM sessions WHERE hash = ?');

/**
 * Authenticate an authorization request.
 * @param request The authorization request object to be authenticated.
 * @returnsSuccess Success state of the authentication.
 */
async function authenticateRequest (request: AuthenticationRequest): Promise<boolean> {
  return await new Promise<boolean>((resolve, reject) => {
    try {
      hashThis(request.session_key).then((hashedKey) => {
      // Retrieve the session hash for the user from the database
        const userResult: User = userQuery?.get(request.email) as User;

        if (userResult === undefined) { resolve(false); return; }
        if (userResult.session_hash !== hashedKey) { resolve(false); return; }
        // Retrieve the session expiry from the database
        const sessionResult: unknown = sessionQuery?.get(userResult.session_hash);
        // Get the current timestamp
        const timestamp = Math.round(Date.now() / 1000);

        // Can not authenticate user if the session is undefined or expired
        if (sessionResult === undefined || (sessionResult as Session).expiry < timestamp) { resolve(false); return; }

        // Update the session expiry in the database by 1 hour from now
        executeQuery('UPDATE sessions SET expiry = ? WHERE token = ?', [(timestamp + EXPIRE_IN_SECONDS), request.session_key], true, true);
        resolve(true);
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
 * Start the MQTT authentication listener
 * @param client The MQTT client to listen for messages.
 * @description Used for authorising users to the system.
 * expected message format: REQID/EMAIL/SESSION/*
 * REQID: Random unique id that requestor sets to identify an authentication request. Is not stored persistently in a DB.
 * EMAIL: User's email
 * SESSION: User's session key
 */
export async function listenForAuthorise (client: mqtt.MqttClient): Promise<void> {
  // Set up a listener for MQTT messages
  client?.on('message', (topic: string, message: Buffer) => {
    // Check if the message is on the AUTHREQ topic
    if (topic === TOPIC) {
      // Parse the raw request, authenticate, and publish the response
      parseRawRequest(message.toString()).then((result: AuthenticationRequest) => {
        authenticateRequest(result).then((authResult) => {
          // Publish the appropriate response (1: authorized, 0: unauthorized)
          if (!authResult) return client.publish(RESPONSE_TOPIC, `${result.reqId}/0/*`);
          client.publish(RESPONSE_TOPIC, `${result.reqId}/1/*`);
        }).catch((err) => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/0/*`);
          console.error(err);
        });
      }).catch((err) => {
        throw Error(err.message);
      });
    }
  });
  // Subscribe client to the AUTHREQ topic
  client.subscribe(TOPIC);
  console.log('Authentication Listener Started');
}
