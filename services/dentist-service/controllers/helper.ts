import { client } from '../mqtt/mqtt';
const TIMEOUT = 10000;

export async function getServiceResponse (reqId: string, RESPONSE_TOPIC: string, isLoginFlow: boolean = false): Promise<string> {
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
          isLoginFlow
            ? resolve(message.toString().split('/')[1])
            : resolve(message.toString().split('/')[1][0]);
        }
      }
    };
    client?.subscribe(RESPONSE_TOPIC);
    client?.on('message', eventHandler);
  });
}
