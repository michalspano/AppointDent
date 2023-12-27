import { config } from 'dotenv';
import { type Request, type Response } from 'express';
import database from './db/config';
import { app, port } from './config/config';
import { mqttClient } from './mqtt/mqtt';
import { basename, dirname } from 'path';
import cookieParser from 'cookie-parser';
import patientRoute from './routes/patientRoute';

const SERVICES_PATH: string = basename(dirname(__dirname));
void mqttClient.setup(SERVICES_PATH);

config();

app.use(cookieParser());
app.use('/', patientRoute);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from: AppointDent - Patients Service');
});

app.listen(port, () => {
  console.log(((database?.open) ?? false) ? 'OK' : 'ERROR');
});
