import httpProxy from 'http-proxy';

const proxyTargets: Record<string, string> = {
  patients: 'http://localhost:3002',
  appointments: 'http://localhost:3003',
  notifications: 'http://localhost:3004',
  dentists: 'http://localhost:3005'
};

export function setupProxies (): Record<string, httpProxy> {
  const proxies: Record<string, httpProxy> = {};
  for (const key in proxyTargets) {
    proxies[key] = httpProxy.createProxyServer({ target: proxyTargets[key], ws: false });
  }
  return proxies;
}

export async function routeThroughProxy (req, res, next): void {
  const targetKey = req.originalUrl.substring(req.baseUrl.length + 1).split('/');
  console.log(targetKey);
}
/*
const handleProxy = (req, res, next) => {
  // req.baseUrl will contain the matched prefix '/api/v1', we can use that to determine target.

  const proxy = proxies[targetKey];
  if (proxy) {
    // Modify the req.url to strip out the targetKey segment, since it's already matched.
    req.url = req.url.substring(targetKey.length + 1);
    proxy.web(req, res, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Proxy error');
      }
    });
  } else {
    next(); // No matching targetKey, continue with other middleware/route handlers
  }
}; */
