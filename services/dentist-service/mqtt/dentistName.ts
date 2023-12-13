import database from '../db/config';
import type * as mqtt from 'mqtt';
import {
  type DenNameRequestMQTT,
  type DenNameRequest
} from '../controllers/types';

const TOPIC: string = 'DENNAME';
const RESPONSE_TOPIC: string = 'DENNAMERES';

/**
 * Validate the format of an MQTT request array.
 * @param msgArr The array representing the MQTT request.
 * @description This method validates that the MQTT request has a correct format
 * and throws an error with the correct request format.
 */
export async function validateRequestFormat (msgArr: string[], requiredLength: number): Promise<void> {
  if (!msgArr[msgArr.length - 1].includes('*')) {
    throw Error('Could not find "*" in message! Please double check that you are sending the full data!');
  }
  if (msgArr.length !== requiredLength) {
    throw Error('Invalid format: REQID/EMAIL/PASSWORD/*');
  }
}

/**
 * @description a bufferized query to get the name of a dentist from their email.
 */
const query = database?.prepare(`
    SELECT firstName,lastName FROM dentists WHERE email = ?
`);

/**
 * Check who the email belongs to.
 * @param request the request object that stores the email.
 * @returns Success state of the operation.
 */
export async function dentistName (request: DenNameRequestMQTT): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    let result: DenNameRequest;
    try {
      result = query?.get(request.email) as DenNameRequest;
    } catch (err: Error | unknown) {
      reject(new Error('One or more queries resulted in zero output.')); return;
    }
    const stringResult: string = result.firstName + ',' + result.lastName;
    resolve(stringResult);
  });
}

/**
 * Parse a raw MQTT request.
 * @param rawMsg
 * @returns DenNameRequestMQTT
 * @description Used to parse and validate an a dentist name request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<DenNameRequestMQTT> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr, 3);
  const request: DenNameRequestMQTT = {
    reqId: msgArr[0],
    email: msgArr[1]
  };
  return request;
}

/**
 * Start dentistName Listener
 * @param client
 * @description Used for checking the name of a dentist from an email
 *
 * expected message format: REQID/email/*
 * REQID: Random unique id that requestor sets to identify an authentication request.
 * Is not stored persistently in a DB. email: The email of a dentist
 */
export async function dentistNameListener (client: mqtt.MqttClient): Promise<void> {
  // Set up a listener for MQTT messages
  client?.on('message', (topic: string, message: Buffer) => {
    if (topic === TOPIC) {
      // Parse the raw request, insert the user, and publish the response
      parseRawRequest(message.toString()).then((result: DenNameRequestMQTT) => {
        dentistName(result).then((stringResult: string) => {
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
  // Subscribe the client to the topic
  client.subscribe(TOPIC);
  console.log('DENNAME Listener Started');
}
