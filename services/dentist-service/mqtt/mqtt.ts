import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';

export let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    const broker: string | undefined = process.env.BROKER;
    if (broker === undefined) throw Error('Broker details undefined');
    client = mqtt.connect(broker);
    client.on('connect', () => {
      if (client != null) void heartbeat(client, serviceName, 1000);
    });
  }
};
