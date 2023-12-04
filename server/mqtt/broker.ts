import cluster from 'cluster';
import os from 'os';
import Aedes from 'aedes';
import { createServer } from 'net';
import aedesPersistenceRedis from 'aedes-persistence-redis';
import type { RedisConnectionOptions } from 'aedes-persistence-redis';
import MQEmitterRedis from 'mqemitter-redis';

const rawPort: string | undefined = process.env.LOCAL_BROKER_PORT;
const port: number = rawPort === undefined ? 1883 : parseInt(rawPort);
const redisConnection: RedisConnectionOptions = {
  port: 6379,
  host: '127.0.0.1'
};

if (cluster.isPrimary) {
  const nWorkers = os.cpus().length;
  if (nWorkers === 0) { console.error('Cannot find any available CPU cores. Exiting...'); process.exit(1); }
  /**
   * For each CPU core, fork the process onto a new thread.
   */
  for (let i = 0; i < nWorkers; i++) {
    cluster.fork();
  }
  cluster.on('exit', (_worker, exitCode, _reason) => {
    console.log('Worker exited with code: ' + exitCode);
  });
} else {
  const aedes = new Aedes({
    persistence: aedesPersistenceRedis(redisConnection),
    mq: MQEmitterRedis(redisConnection),
    concurrency: 100,
    queueLimit: 1000,
    connectTimeout: 1200000
  });
  const server = createServer(aedes.handle);
  server.listen(port, function () {
    console.log(`MQTT Broker ${process.pid} started at port: ${port}`);
  });
  process.on('uncaughtException', (err) => {
    console.error(`Exception: ${err.message}`);
  });
}
