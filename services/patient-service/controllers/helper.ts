import { client } from '../mqtt/mqtt';
const TIMEOUT = 10000;
/**
 * Used to wait for a response from mqtt before continuing the execution of the request processing.
 * @param reqId the id of the request sent over MQTT
 * @param RESPONSE_TOPIC the topic which to listen for
 * @param isLoginFlow used to
 * @returns The result if the user is authenticated or not
 */
export async function getServiceResponse (reqId: string, RESPONSE_TOPIC: string): Promise<string | undefined> {
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client?.unsubscribe(RESPONSE_TOPIC);
      reject(new Error('MQTT timeout'));
    }, TIMEOUT);
    const eventHandler = (topic: string, message: Buffer): void => {
      if (topic === RESPONSE_TOPIC) {
        if (message.toString().startsWith(`${reqId}/`)) {
          clearTimeout(timeout);
          client?.unsubscribe(topic);
          client?.removeListener('message', eventHandler);
          resolve(message.toString().split('/')[1]);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
}

/**
 * @description number of key-value pairs that a patient has.
 * This can be checked dynamically, but this is more efficient,
 * because it is rarely changed.
 */
const NUM_OF_FIELDS: Readonly<number> = 4;

/**
 * @description an array of keys that are of type number.
 */
const NUMBER_KEYS: readonly string[] = [
  'birthDate'
];

/**
 * @description a helper function that dynamically checks if a given patient is
 * constructed correctly. A patient has only string-based values.
 *
 * @param patient the current values for a potential patient (can be incomplete,
 * incorrect).
 * @returns a boolean flag
 */
export const isValidPatient = (patient: Record<string, any>): boolean => {
  if (NUM_OF_FIELDS !== Object.keys(patient).length) {
    return false;
  }

  // Predicate to check if the type of a given key is valid.
  const isValidType = (key: string, value: any): boolean => {
    if (NUMBER_KEYS.includes(key)) return typeof value === 'number';
    return typeof value === 'string';
  };

  // Predicate to check if the dentist is valid.
  const isValid: boolean = Object.entries(patient)
    .every(([key, value]) => isValidType(key, value));
  return isValid;
};
