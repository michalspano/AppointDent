import { type NextFunction, type Request, type Response } from 'express';
import httpProxy from 'http-proxy';

const proxyTargets: Record<string, string> = {
  patients: 'http://localhost:3002',
  appointments: 'http://localhost:3003',
  notifications: 'http://localhost:3004',
  dentists: 'http://localhost:3005'
};
const proxies: Record<string, httpProxy> = {};
for (const key in proxyTargets) {
  console.log(key);
  proxies[key] = httpProxy.createProxyServer({ target: proxyTargets[key], ws: false });
}

export function routeProxy (req: Request, res: Response, next: NextFunction): void {
  const pathParts = req.url.split('/'); // Use req.url to include query string if necessary.

  const service = pathParts[1];
  const target: httpProxy | undefined = proxies[service];

  if (target !== undefined) {
    // Remove the service name.
    const newPath = pathParts.slice(2).join('/');
    console.log('New path ' + newPath);
    req.url = newPath;
    req.originalUrl = newPath;
    target.web(req, res, {}, (err: Error) => {
      throw new Error(err.message);
    });
  } else {
    next();
  }
}
