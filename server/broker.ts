import Aedes from 'aedes';
import type { Server } from 'net';
import { createServer } from 'net';

const port: number = 1883;
const aedes: Aedes = new Aedes();
const server: Server = createServer(aedes.handle);

server.listen(port, function () {
  console.log('MQTT Broker start at port:', port);
});
