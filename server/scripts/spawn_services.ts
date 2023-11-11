import fs, { type Stats } from "fs";
import { ChildProcess, spawn } from 'child_process';

/**
 * @param servicesPath the path to the services directory.
 * @description spawn the services in the services directory.
 */
function spawnServices(servicesPath: string): void {
    fs.readdir(servicesPath, ((err: NodeJS.ErrnoException | null, services: string[]) => {

        if (err) throw Error(err.message);
        console.log("Building services...");

        for (let i = 0; i < services.length; i++) {
            const serviceName: string = services[i].toLocaleUpperCase();
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
}

export default spawnServices;