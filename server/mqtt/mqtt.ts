import * as mqtt from 'mqtt';
import { listenForHeartbeat } from './heartbeatListener';

export let client = undefined as mqtt.MqttClient | undefined;

export const mqttClient = {
  setup: async (services: string[], topics: string[]) => {
    const broker: string = process.env.BROKER ?? 'mqtt://localhost:1883';
    client = mqtt.connect(broker);
    client.on('connect', () => {
      if (client != null) void listenForHeartbeat(services, client, 10);
      for (let i = 0; i < topics.length; i++) {
        client?.subscribe(topics[i], (err) => {
          if (err != null) throw Error(err.message);
        });
      }
    });
  }
};
