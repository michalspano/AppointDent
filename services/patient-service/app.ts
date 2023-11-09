import { config } from 'dotenv';
import { type Request, type Response } from 'express';
import database from './db/config';
import { app, port } from "./config/config";

config();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from: AppointDent - Patients Service');
});
app.listen(port, () => {
  console.log('AppointDent - Patients Service');
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Using database: ${database?.name}`);
  console.log(`Database connection: ${database?.open ? 'OK' : 'ERROR'}`);
});