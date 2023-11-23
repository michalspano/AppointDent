import { validateRequestFormat } from '../helper/validator';
import type { QueryResult, Notification } from '../types/types';
import * as crypto from 'crypto';
import database from '../db/config';
import { type Statement } from 'better-sqlite3';
import { type MqttClient } from 'mqtt/*';

// 'not' in variable names is short term for 'notification'
const TOPIC = 'NOTREQ';

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
      notification.timestamp = Date.parse(Date.now().toString());
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
