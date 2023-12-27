import { type NextFunction, type Request, type Response } from 'express';
import httpProxy from 'http-proxy';
import axios from 'axios';
import * as crypto from 'crypto';

type ProxyMap = Record<string, httpProxy>;
type ProxyTargets = Record<string, string>;
interface AnalyticsData {
  method: string
  path: string
  clientHash: string
  [key: string]: string | number | undefined

}

const DATA_COLLECTOR_API = 'http://localhost:3006';
const DATA_COLLECTOR_API_TIMEOUT = 10000;

/**
 * Supposing that the services may be deployed to remote destinations (that are not localhost),
 * we will need, in the future, to enable these urls to be modified.
 * For that, an .env file could be used, so these values that are "hard-coded"
 * now will be the "fallback" (default) values.
 */
const proxyTargets: ProxyTargets = {
  server: 'http://localhost:3000',
  sessions: 'http://localhost:3001',
  patients: 'http://localhost:3002',
  appointments: 'http://localhost:3003',
  notifications: 'http://localhost:3004',
  dentists: 'http://localhost:3005',
  admins: 'http://localhost:3006'
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
    newProxies[key] = httpProxy.createProxyServer({ target: proxyTargets[key], ws: false });
  }
  return newProxies;
}

async function forwardAnalyticsRequest (url: string, method: string, clientHash: string, retries = 3): Promise<void> {
  const analyticsEntry: AnalyticsData = {
    method,
    path: url,
    clientHash
  };

  // We optimistically send this to analytics, in hopes of it being processed at some point.
  axios.post(DATA_COLLECTOR_API + '/requests', analyticsEntry, { timeout: 0 }).catch((err) => {
    if (retries > 0) {
      setTimeout(() => {
        void forwardAnalyticsRequest(url, method, clientHash, retries - 1);
      }, DATA_COLLECTOR_API_TIMEOUT);
    } else {
      console.error(err);
    }
  });
}

export function routeProxy (req: Request, res: Response, next: NextFunction): void {
  const url = req.originalUrl;
  const method = req.method;
  const clientCookie = req.cookies.sessionKey;
  let clientHash: string = '';
  if (!req.originalUrl.includes('admins')) {
    if (clientCookie !== undefined) {
      crypto.pbkdf2(clientCookie, 'salt', 10, 64, 'sha256', (err, derivedKey) => {
        if (err != null) { throw new Error(err.message); }
        clientHash = derivedKey.toString('hex');
        void forwardAnalyticsRequest(url, method, clientHash);
      });
    } else {
      void forwardAnalyticsRequest(url, method, clientHash);
    }
  }

  const pathParts = req.url.split('/'); // Use req.url to include query string if necessary.
  const service = pathParts[1];
  const target: httpProxy | undefined = proxies[service];

  if (target !== undefined) {
    // Remove the service name.
    const newPath = pathParts.slice(2).join('/');
    req.url = newPath;
    req.originalUrl = newPath;
    const proxytimeout: number = parseInt(process.env.PROXY_TIMEOUT ?? '60000');
    target.web(req, res, { timeout: proxytimeout, proxyTimeout: proxytimeout }, (err: Error) => {
      console.error('Error proxying to target:', err.message);
      res.status(502).send('Bad Gateway');
    });
  } else {
    next();
  }
}
