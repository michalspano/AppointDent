import * as mqtt from "mqtt";
import { listenForHeartbeat } from "./heartbeatListener";

let client = undefined as mqtt.MqttClient | undefined;



export const mqttClient = {
    "setup":(async (services:string[],topics:string[])=>{
        console.log("Setting up MQTT");
        client = mqtt.connect("mqtt://broker.hivemq.com") as (mqtt.MqttClient);
        client.on("connect", () => {
            listenForHeartbeat(services,client!,5);
            for(let i=0;i<topics.length;i++) {
                client?.subscribe(topics[i], (err) => {
                    if(err) throw Error(err.message);
                });
              }    
          });
    })
};

