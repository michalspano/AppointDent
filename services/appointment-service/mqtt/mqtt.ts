import * as mqtt from "mqtt";
import { heartbeat } from "./heartbeat";

// export const client = mqtt.connect("mqtt://broker.hivemq.com");
export const mqttClient = {
    "client": undefined as mqtt.MqttClient | undefined,
    "setup":(async (serviceName:string)=>{
        console.log("Setting up MQTT Client");
        mqttClient.client = mqtt.connect("mqtt://broker.hivemq.com") as (mqtt.MqttClient);

        mqttClient.client.on("connect", () => {
            mqttClient.client?.subscribe("HEARTBEAT/", (err) => {
                if(!err) {
                    heartbeat(mqttClient.client!,serviceName,1000);

                }
              console.log(err);
            });
            /*;*/
          });
          
          mqttClient.client?.on("message", (topic, message) => {
            // message is Buffer
            console.log(message.toString());
            //mqttClient.client?.end();
          });
    })
};

