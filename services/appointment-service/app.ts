import { config } from 'dotenv';
import router from './routes';
import database from './db/config';
import { app, port } from './config/config';
import { mqttClient } from './mqtt/mqtt';
import { basename, dirname } from 'path';
import type { Request, Response } from 'express';

const SERVICES_PATH: string = basename(dirname(__dirname));
void mqttClient.setup(SERVICES_PATH);

config();

/**
 * Default home route. Used to check if the service is running.
 * This route can be replaced by something more useful. For now,
 * it is used in the `npm run test` script to check if the service
 * is running (see the `wait-on` command in package.json).
 * @file package.json
 */
app.get('/', (req: Request, res: Response) => {
  res.send('AppointDent - Appointments Service');
});

// Use the routes defined in routes/index.ts.
app.use('/api/appointments', router);

// Handle undefined routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).send('Not found.');
});

app.listen(port, () => {
  console.log('AppointDent - Appointments Service');
  console.log(`Server is running at http://localhost:${port}/api`);
  console.log(`Using database: ${database?.name}`);
  console.log(`Database connection: ${((database?.open) ?? false) ? 'OK' : 'ERROR'}`);
});
