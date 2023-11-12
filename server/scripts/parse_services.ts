import fs, { type Stats } from 'fs';

async function parseService (service: string, servicesPath: string, parsedServices: string[]): Promise<void> {
  await new Promise<void>((resolve) => {
    const assumedService: string = servicesPath + '/' + service;
    fs.lstat(assumedService, (err: NodeJS.ErrnoException | null, stats: Stats) => {
      if (err != null) throw Error(err.message);
      if (stats.isDirectory()) {
        parsedServices.push(service);
      }
      resolve();
    });
  });
}

export async function parseServices (servicesPath: string, parsedServices: string[]): Promise<void> {
  await new Promise<void>((resolve) => {
    fs.readdir(servicesPath, (_err: NodeJS.ErrnoException | null, services: string[]) => {
      const parseRequests = services.map(async service => { await parseService(service, servicesPath, parsedServices); });
      Promise.allSettled(parseRequests).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') throw Error(`Parsing ${services[index]} failed`);
        });
        resolve();
      }).catch((err) => {
        console.error(err);
      });
    });
  });
}
