import { config } from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';
import spawnServices from './scripts/spawn_services';
import fs, { Stats } from "fs";
import { mqttClient } from './mqtt/mqtt';
config(); // init dotenv environment

const TOPICS=["HEARTBEAT"];
const parsedServices:string[]=[];
const app: Express = express();
app.use(express.json()); // for parsing application/json

const port: string = process.env.PORT ?? '3000';
const servicesPath: string = process.env.SERVICES_PATH || "../services";

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from AppointDent!');
});

async function parseService(service:string,servicesPath:string): Promise<void>{
  return new Promise((resolve)=>{
    const assumedService: string = servicesPath + "/" + service;
    fs.lstat(assumedService, ((err: NodeJS.ErrnoException | null, stats: Stats) => {
        if (err) throw Error(err.message);
        if (stats.isDirectory()) {
          parsedServices.push(service!);
        }
        resolve();
      }));  
  });
}

async function parseServices(): Promise<void>{ 
  return new Promise((resolve)=>{
    fs.readdir(servicesPath, (async (err: NodeJS.ErrnoException | null, services: string[]) => {
      const parseRequests = services.map(service => parseService(service, servicesPath));
      const results=await Promise.allSettled(parseRequests);
      results.forEach((result, index) => {
        if(result.status==="rejected") throw Error(`Parsing ${services[index]} failed`);
      });
      resolve();
    }));
  });
}

app.listen(port,async () => {
  console.log('Hello from AppointDent!');
  console.log(`Server is running at http://localhost:${port}`);
    await parseServices();
    await spawnServices(servicesPath,parsedServices);
    mqttClient.setup(parsedServices,TOPICS);
});
