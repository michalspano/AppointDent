import { config } from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';
import spawnServices from './scripts/spawn_services';
import { mqttClient } from './mqtt/mqtt';
import { parseServices } from './scripts/parse_services';
config(); // init dotenv environment

const TOPICS = ['HEARTBEAT'];
const parsedServices: string[] = [];
const app: Express = express();
app.use(express.json()); // for parsing application/json

const port: string = process.env.PORT ?? '3000';
const servicesPath: string = process.env.SERVICES_PATH ?? '../services';

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from AppointDent!');
});

async function setupServices (): Promise<void> {
  await parseServices(servicesPath, parsedServices);
  await spawnServices(servicesPath, parsedServices);
}

app.listen(port, () => {
  console.log('Hello from AppointDent!');
  console.log(`Server is running at http://localhost:${port}`);
  void setupServices();
  void mqttClient.setup(parsedServices, TOPICS);
});
