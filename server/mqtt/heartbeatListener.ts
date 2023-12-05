import type * as mqtt from 'mqtt';

const heartbeatMonitor: Record<string, number> = {};

export async function panicMonitor (inspectInterval: number, panicThreshold: number): Promise<string[]> {
  return await new Promise((resolve) => {
    const killedServices: string[] = [];
    setInterval(() => {
      for (const key in heartbeatMonitor) {
        const diff: number = Math.round(Date.now() / 1000) - heartbeatMonitor[key];
        if (diff > panicThreshold) {
          killedServices.push(key);
          console.log(`${key} flatlined.`);
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete heartbeatMonitor[key];
        }
      }
      if (killedServices.length > 0) {
        console.log('killed', killedServices);
        resolve(killedServices);
      }
    }, inspectInterval);
    resolve(killedServices);
  });
}

export async function listenForHeartbeat (services: string[], client: mqtt.MqttClient, panicThreshold: number): Promise<void> {
  for (let i = 0; i < services.length; i++) {
    heartbeatMonitor[services[i]] = Math.round(Date.now() / 1000);
  }
  void panicMonitor(500, panicThreshold);

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
