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

async function parseServices(){
  return new Promise((resolve)=>{
    fs.readdir(servicesPath, ((err: NodeJS.ErrnoException | null, services: string[]) => {
      while(services.length>0) {
        const service=services.pop();
        const assumedService: string = servicesPath + "/" + service;
        fs.lstat(assumedService, ((err: NodeJS.ErrnoException | null, stats: Stats) => {
            if (err) throw Error(err.message);
            if (stats.isDirectory()) {
              parsedServices.push(service!);
            }
          }));  
      }
      const watcher=setInterval(()=>{
        if(services.length===0) {
          resolve(true);
          clearInterval(watcher);
        }
      });

    }));
  });
   
}

app.listen(port,async () => {
  console.log('Hello from AppointDent!');
  console.log(`Server is running at http://localhost:${port}`);
  //Retrieve all services.
    await parseServices();
    console.log(parsedServices);
    await spawnServices(servicesPath,parsedServices);
    mqttClient.setup(parsedServices,TOPICS);

});
