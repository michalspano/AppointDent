import fs, { type Stats } from "fs";
import { ChildProcess, spawn } from 'child_process';

async function spawnService(serviceName:string,assumedService:string) {
    console.log("Spawning");
    console.log(serviceName);
    return new Promise((resolve,reject)=> {
        const build_process: ChildProcess = spawn('npm', ['run', 'build'], { cwd: assumedService });

        build_process.stderr!.on('data', (data) => {
            console.log(data);
            reject(`${serviceName} build failed`);
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
                    resolve(true);
                });
    
                child.stderr!.on('data', (data) => {
                    console.error(`${serviceName}: ${data}`);
                });
    
                child.on('close', (code: number | null) => {
                    console.log(`${serviceName} process exited with code ${code}`);
                });
            }
        });
    });

}

/**
 * @param servicesPath the path to the services directory.
 * @description spawn the services in the services directory.
 */
async function spawnServices(servicesPath: string, services: string[]): Promise<boolean> {
    try {
        console.log("Building services...");
        // Create an array of promises to spawn the services
        const startRequests=[];
        for(let i=0;i<services.length;i++) {
            console.log(services[i]);
            startRequests.push(spawnService(services[i],servicesPath));
        }
        console.log(startRequests); // This should log an array of Promise objects
        // Wait for all the promises to be settled
        const results = await Promise.allSettled(startRequests);

        // Process the results
        const allSucceeded = results.every(result => result.status === 'fulfilled');
        if (allSucceeded) {
            console.log("All services have been spawned successfully.");
            return true;
        } else {
            console.log("Some services failed to spawn.");
            return false;
        }
    } catch (error) {
        console.error("An error occurred while spawning services:", error);
        return false;
    }
}

export default spawnServices;