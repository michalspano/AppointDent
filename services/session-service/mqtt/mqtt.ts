import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';
import { listenForAuthorise } from './authorisation';
import { listenForInsertion } from './insert-user';
import { listenForSessionCreation } from './create-session';

// Define client with an initial value of "undefined"
let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    // Connect to the MQTT broker
    client = mqtt.connect('mqtt://broker.hivemq.com');
    // Listening for the "connect" event
    client.on('connect', () => {
      if (client != null) {
        void listenForAuthorise(client);
        void listenForInsertion(client);
        void listenForSessionCreation(client);
        // Send heartbeat with interval of 1 second
        void heartbeat(client, serviceName, 1000);
      }
    });
  }
};
