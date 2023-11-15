import { type ChildProcess, spawn } from 'child_process';

async function spawnService (serviceName: string, servicesPath: string): Promise<ChildProcess> {
  const servicePath = servicesPath + '/' + serviceName;
  return await new Promise((resolve, reject) => {
    const buildProcess: ChildProcess = spawn('npm', ['run', 'build'], { cwd: servicePath });

    buildProcess.on('close', (code: number | null) => {
      console.log(`${serviceName} build process exited with code ${code}`);

      if (code === 0) {
        console.log(`${serviceName} build succeeded, spawning...`);

        // Remove PORT from the child process environment
        const childEnv: NodeJS.ProcessEnv = process.env;
        delete childEnv.PORT;

        const child: ChildProcess = spawn('npm', ['run', 'start'], {
          cwd: servicePath,
          env: childEnv
        });

        child.stdout?.on('data', (data) => {
          console.log(`${serviceName}: ${data}`);
          resolve(child);
        });

        child.stderr?.on('data', (data) => {
          console.error(`${serviceName}: ${data}`);
        });

        child.on('close', (code: number | null) => {
          console.log(`${serviceName} process exited with code ${code}`);
        });
      } else {
        reject(new Error(`${serviceName} build failed`));
      }
    });
  });
}

/**
 *
 * @param servicesPath
 * @param services
 * @description Spawns all services that are listed in the specified servicesPath
 * as separate processes. Adds event handlers for interrupt signals to ensure graceful shutdown.
 */
async function spawnServices (servicesPath: string, services: string[]): Promise<void> {
  try {
    const startRequests = services.map(async service => await spawnService(service, servicesPath));
    const results: Array<PromiseSettledResult<ChildProcess>> = await Promise.allSettled(startRequests);
    const children: Array<{ name: string, process: ChildProcess }> = [];

    results.forEach((result: PromiseSettledResult<ChildProcess>, index: number) => {
      if (result.status === 'rejected') throw Error(`Service ${services[index]} failed`);
      children.push({
        name: services[index],
        process: result.value
      });
    });

    ['SIGINT', 'SIGTERM', 'SIGQUIT', 'exit'].forEach((event: string) => {
      process.on(event, () => {
        while (children.length > 0) {
          const child = children.pop();
          child?.process.kill();
          console.log('Killed ' + child?.name);
        }
        process.exit(0);
      });
    });
  } catch (error: any) {
    throw Error(`An error occurred while spawning services: ${error}`);
  }
}

export default spawnServices;
