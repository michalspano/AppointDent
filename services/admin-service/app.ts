/**
 * app.ts - appointments-service
 *
 * @description :: The main entry point for the admin service.
 * @version     :: 1.0
 * @access      :: private
 * @license     :: (MIT) 2023, AppointDent Authors
 * @status      :: experimental
 * @deprecated  :: false
 */

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
const port: string = process.env.PORT ?? '3006';

// Can be removed if redundant later.
app.head('/', (req: Request, res: Response) => res.sendStatus(200));

// Use the routes defined in routes/index.ts.
app.use('/', router);

// Handle undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).send('Not found.');
});

app.listen(port, () => {
  console.log(((database?.open) ?? false) ? 'OK' : 'ERROR');
});
