import * as mqtt from "mqtt";

// export const client = mqtt.connect("mqtt://broker.hivemq.com");
export const mqttClient = {
    "client": undefined as mqtt.MqttClient | undefined,
    "setup":(async (serviceName:string)=>{
        mqttClient.client = mqtt.connect("mqtt://broker.hivemq.com") as (mqtt.MqttClient);
        mqttClient.client.on("connect", () => {
            mqttClient.client?.subscribe("HEARTBEAT/", (err) => {
                if(!err) {
                    heartbeat(mqttClient.client!,serviceName,1000);
                }
            });
          });
        
          mqttClient.client?.on("message", (topic, message) => {
            console.log(message.toString());
            //mqttClient.client?.end();
          });
    })
};

