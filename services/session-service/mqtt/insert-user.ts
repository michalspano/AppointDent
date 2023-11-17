import database from '../db/config';
import * as crypto from 'crypto';
import type * as mqtt from 'mqtt';
import { type CreateUser, type QueryResult } from '../types/types';
import { validateRequestFormat } from '../helper/validator';

const TOPIC = 'INSERTUSER';
const RESPONSE_TOPIC = 'INSERTUSERRES';
/**
 * Insert user into database.
 * @param user The user object to be inserted.
 * @returns Success state of the operation.
 */
export async function insertUser (user: CreateUser): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    try {
      // SQL query to enter user to database
      const insertQuery = database?.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
      if (insertQuery === undefined) reject(new Error('Query is undefined.'));

      // Hash the user's password
      const hash: string = crypto.createHash('sha256').update(user.password).digest('hex');
      // Execute the query with user email, hashed password and session hash which will be empty.
      const result: QueryResult = insertQuery?.run(user.email, hash) as QueryResult;
      if (result.changes === 0) reject(new Error('No changes made.'));
      console.log('User added successfully.');
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
 * Parse a raw MQTT user insertion request.
 * @param rawMsg
 * @returns CreateUser
 * @description Used to parse and validate an user insertion request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<CreateUser> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr);
  const request: CreateUser = {
    reqId: msgArr[0],
    email: msgArr[1],
    password: msgArr[2],
    session_hash: ''
  };
  return request;
}

/**
 * Start user insertion listener
 * @param client
 * @description Used for inserting users to the system.
 * expected message format: REQID/EMAIL/PASSWORD/*
 * REQID: Random unique id that requestor sets to identify an authentication request. Is not stored persistently in a DB.
 * EMAIL: User's email
 * PASSWORD: User's password in plaintext
 */
export async function listenForInsertion (client: mqtt.MqttClient): Promise<void> {
  // Set up a listener for MQTT messages
  client?.on('message', (topic: string, message: Buffer) => {
    // Check if the topic is 'INSERTUSER'
    if (topic === TOPIC) {
      // Parse the raw request, insert the user, and publish the response
      parseRawRequest(message.toString()).then((result: CreateUser) => {
        insertUser(result).then(() => {
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
  // Subscribe the client to the INSERTUSER topic
  client.subscribe(TOPIC);
  console.log('Insertion Listener Started');
}
