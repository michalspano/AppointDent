import * as mqtt from 'mqtt';
import { listenForHeartbeat } from './heartbeatListener';

let client = undefined as mqtt.MqttClient | undefined;

export const mqttClient = {
  setup: async (services: string[], topics: string[]) => {
    const broker: string | undefined = process.env.BROKER;
    if (broker === undefined) throw Error('Broker details undefined');
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
