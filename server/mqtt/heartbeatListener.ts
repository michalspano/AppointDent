import * as mqtt from "mqtt";

const heartbeatMonitor: { [key: string]: number; } = {};

async function panicMonitor(inspectInterval: number, panicThreshold: number) {
    setInterval(async () => {
        for (const key in heartbeatMonitor) {
            const diff = Math.round(Date.now() / 1000) - heartbeatMonitor[key];
            if (diff > panicThreshold) {
                console.error(`${key} flatlined.`);
            }
        }
    }, inspectInterval);
}

export async function listenForHeartbeat(services: string[], client: mqtt.MqttClient, panicThreshold: number) {
    for (let i = 0; i < services.length; i++) {
        heartbeatMonitor[services[i]] = Math.round(Date.now() / 1000);
    }
    panicMonitor(500, panicThreshold);

    client?.on("message", (topic, message) => {
        if (topic === "HEARTBEAT") {
            for (const key in heartbeatMonitor) {
                if (message.toString() === key) {
                    heartbeatMonitor[key] = Math.round(Date.now() / 1000);
                }
            }
        }
    });
}