import router from './routes';
import { config } from 'dotenv';
import app from './config/config';
import database from './db/config';
import { basename, dirname } from 'path';
import { mqttClient } from './mqtt/mqtt';
import type { Request, Response } from 'express';

const SERVICES_PATH: string = basename(dirname(__dirname));
void mqttClient.setup(SERVICES_PATH);

config(); // read .env file

/**
 * @description The port on which the server is running.
 * @see process.env.PORT
 */
const port: string = process.env.PORT ?? '3003';

// Use the routes defined in routes/index.ts.
app.use('/', router);

// TODO: examine the feasibility of this route and if it is needed.
app.get('/', (req, res) => {
  res.sendStatus(200);
});

// Handle undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).send('Not found.');
});

app.listen(port, () => {
  console.log('AppointDent - Appointments Service');
  console.log(`Server is running at http://localhost:${port}/`);
  console.log(`Using database: ${database?.name}`);
  console.log(`Database connection: ${((database?.open) ?? false) ? 'OK' : 'ERROR'}`);
});
