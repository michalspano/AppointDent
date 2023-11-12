import * as mqtt from 'mqtt'
import { listenForHeartbeat } from './heartbeatListener'

let client = undefined as mqtt.MqttClient | undefined

export const mqttClient = {
  setup: async (services: string[], topics: string[]) => {
    client = mqtt.connect('mqtt://broker.hivemq.com')
    client.on('connect', () => {
      if (client != null) void listenForHeartbeat(services, client, 5)
      for (let i = 0; i < topics.length; i++) {
        client?.subscribe(topics[i], (err) => {
          if (err != null) throw Error(err.message)
        })
      }
    })
  }
}
