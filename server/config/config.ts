import cors from 'cors';
import morgan from 'morgan';
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
app.use(morgan('dev')); // Add morgan HTTP request logger.

interface CorsOptions {
  origin: boolean
  credentials: boolean
}

const allowedOrigins = ['http://localhost:5173'];
/**
 * This function has the responsibility of dynamically setitng the
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
