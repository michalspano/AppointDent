import { type NextFunction, type Request, type Response } from 'express';
import httpProxy from 'http-proxy';
type ProxyMap = Record<string, httpProxy>;
type ProxyTargets = Record<string, string>;
/**
 * Supposing that the services may be deployed to remote destinations (that are not localhost),
 * we will need, in the future, to enable these urls to be modified.
 * For that, an .env file could be used, so these values that are "hard-coded"
 * now will be the "fallback" (default) values.
 */
const proxyTargets: ProxyTargets = {
  patients: 'http://localhost:3002',
  appointments: 'http://localhost:3003',
  notifications: 'http://localhost:3004',
  dentists: 'http://localhost:3005'
};

const proxies: ProxyMap = constructProxies(proxyTargets);

/**
 * Converts the listed proxy targets into proxy servers
 * @param targets proxy targets
 * @returns proxy map
 */
function constructProxies (targets: ProxyTargets): ProxyMap {
  const newProxies: ProxyMap = {};
  for (const key in proxyTargets) {
    console.log(key);
    newProxies[key] = httpProxy.createProxyServer({ target: proxyTargets[key], ws: false });
  }
  return newProxies;
}

export function routeProxy (req: Request, res: Response, next: NextFunction): void {
  const pathParts = req.url.split('/'); // Use req.url to include query string if necessary.

  const service = pathParts[1];
  const target: httpProxy | undefined = proxies[service];

  if (target !== undefined) {
    // Remove the service name.
    const newPath = pathParts.slice(2).join('/');
    req.url = newPath;
    req.originalUrl = newPath;
    target.web(req, res, {}, (err: Error) => {
      throw new Error(err.message);
    });
  } else {
    next();
  }
}
