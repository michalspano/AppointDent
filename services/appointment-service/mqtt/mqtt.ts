import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';

/**
 * @description the MQTT client used to communicate with the MQTT broker.
 * @see mqttClient.setup for more information.
 */
export let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    const broker: string = process.env.BROKER ?? 'mqtt://localhost:1883';
    client = mqtt.connect(broker);
    client.once('connect', () => {
      if (client != null) void heartbeat(client, serviceName, 1000);
      client?.setMaxListeners(5000);
    });
  }
};
