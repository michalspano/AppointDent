import { type MqttClient } from 'mqtt/*';
const TIMEOUT = 10000;

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
