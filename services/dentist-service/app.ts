import { config } from 'dotenv';
import database from './db/config';
import { app, port } from './config/config';
import { mqttClient } from './mqtt/mqtt';
import { basename, dirname } from 'path';
import routes from './routes/routes';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';

const SERVICES_PATH: string = basename(dirname(__dirname));
void mqttClient.setup(SERVICES_PATH);

config();

app.use(cookieParser());
app.use('/', routes);

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from: AppointDent - Dentists Service');
});
app.listen(port, () => {
  console.log('AppointDent - Dentists Service');
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Using database: ${database?.name}`);
  console.log(`Database connection: ${((database?.open) ?? false) ? 'OK' : 'ERROR'}`);
});
