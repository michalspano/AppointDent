import database from '../db/config';
import type * as mqtt from 'mqtt';
import {
  type PatientNameRequestMQTT,
  type PatientNameRequest
} from '../utils/types';

const TOPIC: string = 'PANAME';
const RESPONSE_TOPIC: string = 'PANAMERES';

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
    throw Error('Invalid format: REQID/EMAIL/*');
  }
}

/**
 * @description a bufferized query to get the name of a patient from their email.
 */
const query = database?.prepare(`
    SELECT firstName,lastName FROM patients WHERE email = ?
`);

/**
 * Check who the email belongs to.
 * @param request the request object that stores the email.
 * @returns Success state of the operation.
 */
export async function getPaName (request: PatientNameRequestMQTT): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    let result: PatientNameRequest;
    try {
      result = query?.get(request.email) as PatientNameRequest;
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
 * @returns PatientNameRequestMQTT
 * @description Used to parse and validate an a patient name request over MQTT.
 */
async function parseRawRequest (rawMsg: string): Promise<PatientNameRequestMQTT> {
  const msgArr: string[] = rawMsg.split('/');
  await validateRequestFormat(msgArr, 3);
  const request: PatientNameRequestMQTT = {
    reqId: msgArr[0],
    email: msgArr[1]
  };
  return request;
}

/**
 * Start PANAME Listener
 * @param client
 * @description Used for checking the name of a patient from an email
 *
 * expected message format: REQID/email/*
 * REQID: Random unique id that requestor sets to identify an authentication request.
 * Is not stored persistently in a DB. email: The email of a patient
 */
export async function patientNameListener (client: mqtt.MqttClient): Promise<void> {
  // Set up a listener for MQTT messages
  client?.on('message', (topic: string, message: Buffer) => {
    if (topic === TOPIC) {
      // Parse the raw request, insert the user, and publish the response
      parseRawRequest(message.toString()).then((result: PatientNameRequestMQTT) => {
        getPaName(result).then((stringResult: string) => {
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
  console.log('PANAME Listener Started');
}
