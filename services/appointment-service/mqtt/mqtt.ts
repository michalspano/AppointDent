import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';

/**
 * @description the MQTT client used to communicate with the MQTT broker.
 * @see mqttClient.setup for more information.
 */
export let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    client = mqtt.connect('mqtt://broker.hivemq.com');
    client.on('connect', () => {
      if (client != null) void heartbeat(client, serviceName, 1000);
    });
  }
};
