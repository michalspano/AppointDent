import database from '../db/config';
import type * as mqtt from 'mqtt';
import { type WhoIsRequestMQTT, type WhoIsRequest } from '../types/types';
import { validateRequestFormat } from '../helper/validator';
import { hashThis } from '../helper/hash';

const TOPIC = 'WHOIS';
const RESPONSE_TOPIC = 'WHOISRES';
/**
 * Check who a session key belongs to
 * @param user The user object to be deleted.
 * @returns Success state of the operation.
 */
export async function whois (request: WhoIsRequestMQTT): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    hashThis(request.session_key).then((hash) => {
      let result: WhoIsRequest;
      try {
        result = database?.prepare('SELECT email,type FROM users WHERE session_hash = ?').get(hash) as WhoIsRequest;
      } catch (err: Error | unknown) {
        reject(new Error('One or more queries resulted in zero output.')); return;
      }
      const stringResult: string = result.email + '/' + result.type;
      resolve(stringResult);
    }).catch((err) => {
      reject(new Error((err as Error).message));
    });
  });
}
/**
 * Parse a raw MQTT user whois request.
 * @param rawMsg
 * @returns WhoIsRequestMQTT
 * @description Used to parse and validate an user whois request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<WhoIsRequestMQTT> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr, 3);
  const request: WhoIsRequestMQTT = {
    reqId: msgArr[0],
    session_key: msgArr[1]
  };
  return request;
}

/**
 * Start WhoIs Listener
 * @param client
 * @description Used for checking the type of user from a session key
 * expected message format: REQID/sessionKey/*
 * REQID: Random unique id that requestor sets to identify an authentication request. Is not stored persistently in a DB.
 * sessionKey: The session key of a user
 */
export async function listenForWhoIs (client: mqtt.MqttClient): Promise<void> {
  // Set up a listener for MQTT messages
  client?.on('message', (topic: string, message: Buffer) => {
    // Check if the topic is 'whois'
    if (topic === TOPIC) {
      // Parse the raw request, insert the user, and publish the response
      parseRawRequest(message.toString()).then((result: WhoIsRequestMQTT) => {
        whois(result).then((stringResult: string) => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/${stringResult}/*`);
        }).catch((err) => {
          client.publish(RESPONSE_TOPIC, `${result.reqId}/0/*`);
          console.error(err);
        });
      }).catch((err) => {
        console.error(err);
      });
    }
  });
  // Subscribe the client to the whois user topic
  client.subscribe(TOPIC);
  console.log('WHOIS Listener Started');
}
