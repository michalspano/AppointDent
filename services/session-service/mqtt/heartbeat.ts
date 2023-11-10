import * as mqtt from "mqtt";

export async function heartbeat(client:mqtt.MqttClient,serviceName:string,interval:number) {
    setInterval(async ()=>{
        client?.publish("HEARTBEAT", `${serviceName}`);
    },interval);
}
