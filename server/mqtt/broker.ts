import cluster from 'cluster';
import os from 'os';
import Aedes from 'aedes';
import { createServer } from 'net';
import aedesPersistenceRedis from 'aedes-persistence-redis';
import MQEmitterRedis from 'mqemitter-redis';

const port = 1883;

if (cluster.isMaster) {
  // This is the master cluster process
  const numWorkers = os.cpus().length;
  console.log('Starting a new worker with redis');

  console.log(`Master cluster setting up ${numWorkers} workers...`);

  // Fork workers.
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    cluster.fork();
  });
} else {
  // Worker processes have their own Redis persistence and MQEmitter
  const persistence = aedesPersistenceRedis({
    // Your Redis configuration here
    // e.g., port: 6379, host: "127.0.0.1"
    port: 6379,
    host: '127.0.0.1'
  });

  const mqEmitter = MQEmitterRedis({
    // Your Redis configuration here
    // e.g., port: 6379, host: "127.0.0.1"
    port: 6379,
    host: '127.0.0.1'
  });

  // Aedes setup with shared Redis persistence and emitter
  const aedes = new Aedes({
    persistence,
    mq: mqEmitter,
    concurrency: 10000,
    queueLimit: 10000,
    connectTimeout: 1200000
  });

  const server = createServer(aedes.handle);

  server.listen(port, function () {
    console.log(`Worker ${process.pid} started MQTT Broker on port ${port}`);
  });

  // Handle uncaught exceptions to avoid crashing the worker
  process.on('uncaughtException', (err) => {
    console.error(`Caught exception: ${err.message}`);
  });
}
