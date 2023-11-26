import { validateRequestFormat } from '../helper/validator';
import type { QueryResult, Notification } from '../types/types';
import * as crypto from 'crypto';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import { type MqttClient } from 'mqtt/*';

// 'not' in variable names is short term for 'notification'
// Topic that other services use to send request notification-service to make notifications
const TOPIC = 'NOTREQ';

/**
 * @description A request to post notification is sent in the form of 'EMAIL/MESSAGE/*'. the * means
 * that the message was received complete and is not corrupted. We first validate the parsed message
 * and then upon whether it is resolved or rejected resolve the promise with a different value. If the
 * request message was validated, we resolve by making a new 'Notification' object. Otherwise we reject
 * with the produced error and propagate the error.
 * @param rawMsg Message in the form mentioned in the description.
 * @returns A Promise that resolves with creation of a 'Notification' object and is rejected with
 * propagation of the error that was produced
 */
async function parseRawRequest (rawMsg: string): Promise<Notification | Error> {
  const msgArr: string[] = rawMsg.split('/');
  return await new Promise((resolve, reject) => {
    validateRequestFormat(msgArr).then(() => {
      const request: Notification = {
        email: msgArr[0],
        id: '',
        timestamp: 0,
        message: msgArr[1]
      };
      resolve(request);
    }).catch(err => { reject(err); });
  });
}

/**
 * This method returns a promise that creates a notification in the database if the 'rawMsg' is parsed
 * without any errors and in the creation of the row for this notification, no errors are thrown. It is
 * resolved by the newly created notification and rejected withe the error that caused it.
 * @param rawMsg message in the form 'EMAIL/MESSAGE/*'
 * @returns A Promise that is resolved with creation of a notification in the database and is rejected
 * if any error in the execution of the method happens.
 */
async function postNot (rawMsg: string): Promise<Notification | Error> {
  let id: string;
  let notification: Notification;
  let uniqueId: boolean = false;
  let idQueryRes: unknown;

  return await new Promise((resolve, reject) => {
    parseRawRequest(rawMsg).then(result => {
      id = crypto.randomUUID();

      while (!uniqueId) {
        const idQuery: Statement<any> | Statement<[any]> | undefined = database?.prepare('SELECT * FROM notifications WHERE id = ?');
        if (idQuery === undefined) {
          reject(new Error('Selection query not found.'));
        } else {
          idQueryRes = idQuery.get(id);
        }
        if (idQueryRes === undefined) {
          uniqueId = true;
        } else {
          id = crypto.randomUUID();
        }
      }

      notification = result as Notification;
      notification.id = id;
      notification.timestamp = Math.round(Date.now() / 1000);
      const notInsertion = database?.prepare('INSERT INTO notifications (id, timestamp, message, email) VALUES (?, ?, ?, ?)');
      if (notInsertion === undefined) {
        reject(new Error('Insertion query not found.'));
      }
      const insertionRes: QueryResult = notInsertion?.run(notification.id,
        notification.timestamp, notification.message, notification.email) as QueryResult;
      if (insertionRes.changes === 0) {
        reject(new Error('No changes made.'));
      }
      resolve(notification);
    }).catch(err => {
      reject(err);
    });
  });
}

/**
 * @description This method listens for new requests to create notifications over 'NOTREQ' topic.
 * This method uses the MQTT.js functions to create event handlers for proper processing of the requests
 * sent by other services. It will create new notifications using the 'postNot(raqMsg: string)' function.
 * @param client MQTT client
 */
export async function listenForAppointments (client: MqttClient): Promise<void> {
  client.on('message', (topic: string, message: Buffer) => {
    if (topic === TOPIC) {
      postNot(message.toString()).then(result => {
        const notification = result as Notification;
        console.log(notification);
      }).catch(err => {
        console.log(err);
      });
    }
  });
  client.subscribe(TOPIC);
  console.log('Notification insertion listener started');
}
