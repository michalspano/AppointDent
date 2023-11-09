import { config } from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';
import spawnServices from './scripts/spawn_services';

config(); // init dotenv environment

const app: Express = express();
app.use(express.json()); // for parsing application/json

const port: string = process.env.PORT ?? '3000';
const servicesPath: string = process.env.SERVICES_PATH || "../services";

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from AppointDent!');
});

app.listen(port, () => {
  console.log('Hello from AppointDent!');
  console.log(`Server is running at http://localhost:${port}`);
  spawnServices(servicesPath); // spawn services when the server is running
});
