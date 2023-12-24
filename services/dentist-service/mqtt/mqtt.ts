import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';
import { dentistNameListener } from './dentistName';

export let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    const broker: string = process.env.BROKER ?? 'mqtt://localhost:1883';
    client = mqtt.connect(broker);
    client.once('connect', () => {
      if (client != null) {
        void dentistNameListener(client);
        void heartbeat(client, serviceName, 1000);
        client.setMaxListeners(5000);
      }
    });
  }
};
