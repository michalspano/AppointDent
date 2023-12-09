import type * as mqtt from 'mqtt';

const heartbeatMonitor: Record<string, number> = {};
export const killedServices: Record<string, boolean> = {};

export function panicMonitor (inspectInterval: number, panicThreshold: number): void {
  setInterval(() => {
    for (const key in heartbeatMonitor) {
      const diff: number = Math.round(Date.now() / 1000) - heartbeatMonitor[key];
      const isServiceDead: boolean = diff > panicThreshold;
      if (killedServices[key] && isServiceDead) { // to display that service flatlined just once
        console.error(`${key} flatlined.`);
      }
      killedServices[key] = !isServiceDead;
    }
  }, inspectInterval);
}

export async function listenForHeartbeat (services: string[], client: mqtt.MqttClient, panicThreshold: number): Promise<void> {
  for (let i = 0; i < services.length; i++) {
    heartbeatMonitor[services[i]] = Math.round(Date.now() / 1000);
    killedServices[services[i]] = false; // Initialize with false status
  }
  panicMonitor(500, panicThreshold);

  client?.on('message', (topic: string, message: Buffer) => {
    if (topic === 'HEARTBEAT') {
      for (const key in heartbeatMonitor) {
        if (message.toString() === key) {
          heartbeatMonitor[key] = Math.round(Date.now() / 1000);
        }
      }
    }
  });
  console.log('Heartbeat Monitor Started');
}
