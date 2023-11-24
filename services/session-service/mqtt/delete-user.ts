import database from '../db/config';
import type * as mqtt from 'mqtt';
import { type Session, type User, type DeleteUserRequest } from '../types/types';
import { validateRequestFormat } from '../helper/validator';
import { type Statement } from 'better-sqlite3';

const TOPIC = 'DELUSER';
const RESPONSE_TOPIC = 'DELUSERRES';
/**
 * Delete user from database.
 * @param user The user object to be deleted.
 * @returns Success state of the operation.
 */
export async function deleteUser (request: DeleteUserRequest): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    try {
      // Retrieve the session hash for the user from the database
      const userQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT session_hash FROM users WHERE email = ?');
      const userResult: User = userQuery?.get(request.email) as User;

      if (userResult === undefined) { reject(new Error('No such user')); return; }

      // Retrieve the session expiry from the database
      const sessionQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT expiry FROM sessions WHERE hash = ?');
      const sessionResult: unknown = sessionQuery?.get(userResult.session_hash);
      // Get the current timestamp
      const timestamp = Math.round(Date.now() / 1000);
      // Can not authenticate user if the session is undefined or expired
      if (sessionResult === undefined || (sessionResult as Session).expiry < timestamp) { reject(new Error('Cannot authenticate user')); return; }
      const userDeleteQuery = database?.prepare('DELETE FROM users WHERE email = ?');
      const userDeleteResult = userDeleteQuery?.run(request.email);
      const sessionDeleteQuery = database?.prepare('DELETE FROM sessions WHERE hash = ?');
      const sessionDeleteResult = sessionDeleteQuery?.run(userResult.session_hash);
      if (userDeleteResult?.changes === 0 || sessionDeleteResult?.changes === 0) {
        // If no rows were affected, then dentist with the given email was not found
        reject(new Error('One or more queries resulted in zero changes.')); return;
      }
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
 * Parse a raw MQTT user deletion request.
 * @param rawMsg
 * @returns CreateUser
 * @description Used to parse and validate an user insertion request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<DeleteUserRequest> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr, 4);
  const request: DeleteUserRequest = {
    reqId: msgArr[0],
    email: msgArr[1],
    session_key: msgArr[2]
  };
  return request;
}

/**
 * Start user delettion listener
 * @param client
 * @description Used for inserting users to the system.
 * expected message format: REQID/EMAIL/PASSWORD/*
 * REQID: Random unique id that requestor sets to identify an authentication request. Is not stored persistently in a DB.
 * EMAIL: User's email
 * PASSWORD: User's password in plaintext
 */
export async function listenForDeletion (client: mqtt.MqttClient): Promise<void> {
  // Set up a listener for MQTT messages
  client?.on('message', (topic: string, message: Buffer) => {
    // Check if the topic is 'deluser'
    if (topic === TOPIC) {
      // Parse the raw request, insert the user, and publish the response
      parseRawRequest(message.toString()).then((result: DeleteUserRequest) => {
        deleteUser(result).then(() => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/1/*`);
        }).catch((err) => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/0/*`);
          console.error(err);
        });
      }).catch((err) => {
        console.error(err);
      });
    }
  });
  // Subscribe the client to the delete user topic
  client.subscribe(TOPIC);
  console.log('Insertion Listener Started');
}
