import * as mqtt from "mqtt";
import { heartbeat } from "./heartbeat";

let client= undefined as mqtt.MqttClient | undefined;
export const mqttClient = {
    "setup":(async (serviceName:string)=>{
        client = mqtt.connect("mqtt://broker.hivemq.com") as (mqtt.MqttClient);
        client.on("connect", () => {
            heartbeat(client!,serviceName,1000);
          });
    })
};

