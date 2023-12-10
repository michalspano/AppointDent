import { client } from '../mqtt/mqtt';
const TIMEOUT = 10000;

/**
 * Used to wait for a response from mqtt before continuing the execution of the request processing.
 * @param reqId the id of the request sent over MQTT
 * @param RESPONSE_TOPIC the topic which to listen for
 * @param isLoginFlow used to
 * @returns The result if the user is authenticated or not
 */
export async function getServiceResponse (reqId: string, RESPONSE_TOPIC: string): Promise<string> {
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
          resolve(message.toString());
        }
      }
    };
    client?.on('message', eventHandler);
  });
}
