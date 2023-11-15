import { type ChildProcess, spawn } from 'child_process';

/**
 * Spawn an individual service using ChildProcess
 * @param serviceName
 * @param servicesPath
 * @param retryOnBuildFault
 * @returns A running child process
 */
async function spawnService (serviceName: string, servicesPath: string, retryOnBuildFault: boolean): Promise<ChildProcess> {
  const servicePath = servicesPath + '/' + serviceName;
  return await new Promise((resolve, reject) => {
    const buildProcess: ChildProcess = spawn('npm', ['run', 'build'], { cwd: servicePath });

    buildProcess.on('close', (code: number | null) => {
      if (code === 0) {
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
          if (code !== 0) {
            throw new Error(`${serviceName}: Exited with non-zero code`);
          }
        });
      } else if (retryOnBuildFault) {
        /**
         * In the event of an initial fault, we attempt to recover the system using a fault recovery
         * tactic through implemented by npm ci. When working with multiple projects, sometimes the
         * dependecies can conflict, cache can fail or simply miss dependencies.
         *
         * In that case we want to
         * ensure that we have the correct dependencies which we can do through npm ci, which removes node_modules,
         * bypasses package.json and uses package-lock.json to install the exact dependency.
         */
        console.log('Initial attempt failed. Attempting to reinstall node_modules through clean install.');
        const purgeChild: ChildProcess = spawn('npm', ['ci'], {
          cwd: servicePath
        });
        purgeChild.on('close', (code: number | null) => {
          if (code === 0) {
            resolve(spawnService(serviceName, servicesPath, false));
          } else {
            reject(new Error(`${serviceName}: clean install failed`));
          }
        });
      } else {
        reject(new Error(`${serviceName}: Consequent build attempts failed`));
      }
    });
  });
}

/**
 * Spawns all services that are listed in the specified servicesPath
 * @param servicesPath
 * @param services
 */
async function spawnServices (servicesPath: string, services: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    console.log('Building and spawning services...');
    const startRequests = services.map(async service => await spawnService(service, servicesPath, true));
    Promise.allSettled(startRequests).then((results: Array<PromiseSettledResult<ChildProcess>>) => {
      const children: Array<{ name: string, process: ChildProcess }> = [];

      results.forEach((result: PromiseSettledResult<ChildProcess>, index: number) => {
        if (result.status === 'rejected') throw Error(`Service ${services[index]} failed`);
        children.push({ // Store all children in an array so that we can kill them upon shutdown.
          name: services[index],
          process: result.value
        });
      });

      ['SIGINT', 'SIGTERM', 'SIGQUIT', 'exit'].forEach((event: string) => {
        process.on(event, () => {
          while (children.length > 0) {
            const child = children.pop();
            child?.process.kill();
            console.log('Killed ' + child?.name + ' with code SIGTERM');
          }
          process.exit(0);
        });
      });
      resolve();
    }).catch((err) => {
      reject(Error(`Fatal error occurred while spawning services: ${err}`));
    });
  });
}

export default spawnServices;
