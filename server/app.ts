import fs from "fs";
import { config } from 'dotenv';
import { ChildProcess, spawn } from 'child_process';
import type { Stats } from 'fs';
import express, { type Express, type Request, type Response } from 'express';

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
});

// TODO: extract this to a stand-alone script
fs.readdir(servicesPath, ((err: NodeJS.ErrnoException | null, services : string[]) => {

  if (err) throw Error(err.message);
  console.log("Building services...");

  for (let i = 0; i < services.length; i++) {
    const serviceName: string    = services[i].toLocaleUpperCase();
    const assumedService: string = servicesPath + "/" + services[i];

    fs.lstat(assumedService, ((err: NodeJS.ErrnoException | null, stats: Stats) => {
      if (err) throw Error(err.message);
      if (stats.isDirectory()) {
        const build_process: ChildProcess = spawn('npm', ['run', 'build'], { cwd: assumedService });

        build_process.stderr!.on('data', (data) => {
          console.log(`${serviceName} build failed`);
          throw new Error(data);
        });

        build_process.on('close', (code: number | null) => {
          console.log(`${serviceName} build process exited with code ${code}`);

          if (code === 0) {
            console.log(`${serviceName} build succeeded, spawning...`);

            // Remove PORT from the child process environment
            const child_env: NodeJS.ProcessEnv = process.env;
            delete child_env.PORT;

            const child: ChildProcess = spawn('npm', ['run', 'start'], {
              cwd: assumedService,
              env: child_env
            });

            child.stdout!.on('data', (data) => {
              console.log(`${serviceName}: ${data}`);
            });

            child.stderr!.on('data', (data) => {
              console.error(`${serviceName}: ${data}`);
            });

            child.on('close', (code: number | null) => {
              console.log(`${serviceName} process exited with code ${code}`);
            });
          }
        });
      }
    }));
  }
}));
