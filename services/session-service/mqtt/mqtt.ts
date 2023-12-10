import * as mqtt from 'mqtt';
import { heartbeat } from './heartbeat';
import { listenForAuthorise } from './authorisation';
import { listenForInsertion } from './insert-user';
import { listenForSessionCreation } from './create-session';
import { listenForDeletion } from './delete-user';
import { listenForWhoIs } from './whois';

// Define client with an initial value of "undefined"
let client = undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
  setup: async (serviceName: string): Promise<void> => {
    const broker: string = process.env.BROKER ?? 'mqtt://localhost:1883';
    client = mqtt.connect(broker);
    // Listening for the "connect" event
    client.on('connect', () => {
      if (client != null) {
        void listenForAuthorise(client);
        void listenForInsertion(client);
        void listenForDeletion(client);
        void listenForWhoIs(client);
        void listenForSessionCreation(client);
        // Send heartbeat with interval of 1 second
        void heartbeat(client, serviceName, 1000);
      }
    });
    client.setMaxListeners(5000);
  }
};
