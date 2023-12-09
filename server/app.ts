import { config } from 'dotenv';
import { mqttClient } from './mqtt/mqtt';
import { parseServices } from './scripts/parse_services';
import { routeProxy } from './proxy/proxy';
import app from './config/config';
import spawnServices from './scripts/spawn_services';

config(); // init dotenv environment

const port: string = process.env.PORT ?? '3000';

const TOPICS: string[] = ['HEARTBEAT'];
const parsedServices: string[] = [];

/* Middleware */
app.use('/api/v1', routeProxy);
app.get('/', (req, res) => res.sendStatus(200));

const servicesPath: string = process.env.SERVICES_PATH ?? '../services';

/**
 * Wrapper function for app.listen
 */
async function listen (): Promise<void> {
  app.listen(port, () => {
    console.log('Hello from AppointDent!');
    console.log(`Server is running at http://localhost:${port}`);
  });
}
/**
 * @description a helper function to setup services, parse and spawn them,
 * and setups up the mqtt client.
 * @returns {Promise<void>}
 */
async function setupServices (): Promise<void> {
  await parseServices(servicesPath, parsedServices);
  await spawnServices(servicesPath, parsedServices);
  void mqttClient.setup(parsedServices, TOPICS);
  void listen();
}
/**
 * We allow the user to specify whether or not we should spawn
 * all services.
 */
if (!process.argv.includes('--no-spawn')) {
  void setupServices();
} else {
  void listen();
}
