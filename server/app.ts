import express, { type Express, type Request, type Response } from 'express';
import { config } from 'dotenv';
import fs from "fs"
import { ChildProcess, SpawnOptions } from 'child_process';
config(); // init dotenv environment

const app: Express = express();
app.use(express.json()); // for parsing application/json
const port: string = process.env.PORT ?? '3000';
const servicesPath:string=process.env.SERVICES_PATH || "../services"
const spawn = require('child_process').spawn


app.get('/', (req: Request, res: Response) => {
  res.send('Hello from AppointDent!');
});

app.listen(port, () => {
  console.log('Hello from AppointDent!');
  console.log(`Server is running at http://localhost:${port}`);
});

fs.readdir(servicesPath,((err,services)=>{
  if(err) throw Error(err.message)

  for(let i=0;i<services.length;i++) {
    let service=servicesPath+"/"+services[i]
    const child:ChildProcess = spawn('npm', ['run', 'dev'],{cwd:service});
    child.stdout!.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr!.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    }); 
  }
}))
