import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';

let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    const broker: string = process.env.BROKER ?? 'mqtt://localhost:1883';
    client = mqtt.connect(broker);
    client.on('connect', () => {
      if (client != null) void heartbeat(client, serviceName, 1000);
    });
  }
};
