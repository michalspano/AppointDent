import type * as mqtt from 'mqtt';

/**
 * This function sends a heartbeat message to the MQTT broker at a specified interval
 * @param client The MQTT client to use for sending the heartbeat message.
 * @param serviceName The MQTT client to use for sending the heartbeat message.
 * @param interval The interval (in milliseconds) for sending heartbeat messages.
 */
export async function heartbeat (client: mqtt.MqttClient, serviceName: string, interval: number): Promise<void> {
  setInterval(() => {
    client?.publish('HEARTBEAT', `${serviceName}`);
  }, interval);
}
