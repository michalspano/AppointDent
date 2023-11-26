import { type MqttClient } from 'mqtt/*';
const TIMEOUT = 10000;
/**
 * @description This function subscribes to 'RESPONSE_TOPIC'. If the message starts with the 'reqId',
 * then this service (notification service) is interested in it as this means that the message is the
 * response to a request (for authorisation) the notification service published before. This method
 * returns a promise which is resolved by returning the second part of the message string it received,
 * and is rejected if it foes not receive the message response that starts with wanted 'reqId' after
 * 10 seconds.
 * @param client MQTT client
 * @param RESPONSE_TOPIC A topic which sends a response message to a request made before in the code.
 * @param reqId Upon requesting, an id was sent with the message. the client is only interested in a
 * response that has the same id.
 * @returns The second part of the message which is organised using slashes (/). The method returns '0'
 * or '1'. '0' stands for unauthorised and '1' stands for authorised.
 */
export async function getAuth (client: MqttClient, RESPONSE_TOPIC: string, reqId: string): Promise<string> {
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
    client?.on('message', eventHandler);
  });
}
