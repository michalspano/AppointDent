import cors from 'cors';
import express, { type NextFunction, type Express, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import queueMiddleware from 'express-queue';

const app: Express = express();
const queue = queueMiddleware({ maxQueue: -1, activeLimit: 1 });

/**
 * Admins should not have to wait for other's requests, we let them bypass
 * @param req request
 * @param res response
 * @param next next middleware
 */
function bypassQueue (req: Request, res: Response, next: NextFunction): void {
  if (req.path.includes('admins')) { next(); return; };
  queue(req, res, next);
}
app.use(bypassQueue);

/**
 * This middleware has the responsibility of ensuring that dropped connections
 * are destroyed from the queue to prevent them from taking up space. When
 * many thousands of requests accumulate this becomes a problem because they
 * can hang in the system. So if a request is dropped we drop the entire request.
 */
app.use((req, res, next) => {
  // Initiate event listener for closing event
  req.socket.on('close', () => {
    if (req.socket.destroyed) { // If the underlying socket is destroyed
      if (!res.headersSent) { // We double check that the request has not been dropped
        res.end(); // Drop the request.
      }
    }
  });
  // After initialising the event listener we move on to the next middleware.
  next();
});

interface CorsOptions {
  origin: boolean
  credentials: boolean
}

/**
 * A collection of allowed origins. By default, only local origins are permitted.
 * Adjust the origins per the requirements of your deployment schema.
 */
const allowedOrigins = Object.freeze([
  'http://localhost:5173', // For `dev` mode in client
  'http://localhost:4173'  // For production of client
]);

/**
 * This function has the responsibility of dynamically setting the
 * Access-Control-Allow-Origin header by checking if the current origin
 * is present in the allowedOrigins array. This is a technical constraint
 * from modern browsers that we have to comply with.
 * @param req request
 * @param corsCallback callback to the CORS function
 */
const corsOptionsSetter = function (req: Request, corsCallback: (err: any, options: CorsOptions) => void): void {
  let corsOptions: any = { origin: false };
  if (req.header('Origin') !== undefined) {
    if (allowedOrigins.includes(req.header('Origin') as string)) {
      corsOptions = { origin: true, credentials: true };
    }
  }
  corsCallback(null, corsOptions);
};

app.use(cors(corsOptionsSetter));
app.use(cookieParser()); // Add cookie parser.

export default app;
