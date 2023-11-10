import { config } from 'dotenv';
import { type Request, type Response } from 'express';
import database from './db/config';
import { app, port } from "./config/config";
import { mqttClient } from './mqtt/mqtt';
import path from "path";
const SERVICES_PATH = path.basename(path.dirname(__dirname));
mqttClient.setup(SERVICES_PATH);

config();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from: AppointDent - Notifications Service');
});
app.listen(port, () => {
  console.log('AppointDent - Notifications Service');
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Using database: ${database?.name}`);
  console.log(`Database connection: ${database?.open ? 'OK' : 'ERROR'}`);
});