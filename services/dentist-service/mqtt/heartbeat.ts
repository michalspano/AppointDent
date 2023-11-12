import type * as mqtt from 'mqtt';

export async function heartbeat (client: mqtt.MqttClient, serviceName: string, interval: number): Promise<void> {
  setInterval(() => {
    client?.publish('HEARTBEAT', `${serviceName}`);
  }, interval);
}
