import { ChildProcess, spawn } from 'child_process';

async function spawnService(serviceName:string,servicesPath:string):Promise<ChildProcess> {
    const servicePath=servicesPath+"/"+serviceName;
    return new Promise((resolve,reject)=> {
        const build_process: ChildProcess = spawn('npm', ['run', 'build'], { cwd: servicePath });

        build_process.stderr!.on('data', () => {
            reject(`${serviceName} build failed`);
        });
    
        build_process.on('close', (code: number | null) => {
            console.log(`${serviceName} build process exited with code ${code}`);
    
            if (code === 0) {
                console.log(`${serviceName} build succeeded, spawning...`);
    
                // Remove PORT from the child process environment
                const child_env: NodeJS.ProcessEnv = process.env;
                delete child_env.PORT;
                
                const child: ChildProcess = spawn('npm', ['run', 'start'], {
                    cwd: servicePath,
                    env: child_env
                });
    
                child.stdout!.on('data', (data) => {
                    console.log(`${serviceName}: ${data}`);
                    resolve(child);
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
async function spawnServices(servicesPath: string, services: string[]): Promise<void> {
    try {
        
        const startRequests = services.map(service => spawnService(service, servicesPath));
        const results:PromiseSettledResult<ChildProcess>[] = await Promise.allSettled(startRequests);
        const children:{name:string,process:ChildProcess}[]=[];

        results.forEach((result, index) => {
            if(result.status==="rejected") throw Error(`Service ${services[index]} failed`);
            children.push({
                "name":services[index],
                "process":result.value
            });
        });

        ['SIGINT', 'SIGTERM', 'SIGQUIT', 'exit'].forEach((event) => {
            process.on(event, () => {
                while(children.length>0){
                    const child=children.pop();
                    child?.process.kill();
                    console.log("Killed "+child?.name);
                }
                process.exit(0);
            });
        });
            
    } catch (error) {
        throw Error("An error occurred while spawning services: "+error);
    }
}

export default spawnServices;