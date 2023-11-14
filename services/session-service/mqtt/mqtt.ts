import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';
import { listenForAuthorise } from './authorisation';

let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    client = mqtt.connect('mqtt://broker.hivemq.com');
    client.on('connect', () => {
      if (client != null) {
        void listenForAuthorise(client);
        void heartbeat(client, serviceName, 1000);
      }
    });
  }
};
