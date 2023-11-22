import { config } from 'dotenv';
import express from 'express';
import spawnServices from './scripts/spawn_services';
import { mqttClient } from './mqtt/mqtt';
import { parseServices } from './scripts/parse_services';
import { routeProxy } from './proxy/proxy';
import cors from 'cors';
config(); // init dotenv environment

const TOPICS = ['HEARTBEAT'];
const parsedServices: string[] = [];
const app = express();
// Enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());
app.use('/api/v1', routeProxy);

const port: string = process.env.PORT ?? '3000';
const servicesPath: string = process.env.SERVICES_PATH ?? '../services';

async function setupServices (): Promise<void> {
  await parseServices(servicesPath, parsedServices);
  await spawnServices(servicesPath, parsedServices);
  void mqttClient.setup(parsedServices, TOPICS);
}

app.listen(port, () => {
  console.log('Hello from AppointDent!');
  console.log(`Server is running at http://localhost:${port}`);
  void setupServices();
});
