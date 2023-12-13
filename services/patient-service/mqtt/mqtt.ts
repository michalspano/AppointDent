import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';
import { patientNameListener } from './PatientName';

export let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    const broker: string = process.env.BROKER ?? 'mqtt://localhost:1883';
    client = mqtt.connect(broker);
    client.on('connect', () => {
      if (client != null) {
        void patientNameListener(client);
        void heartbeat(client, serviceName, 1000);
      }
    });
  }
};
