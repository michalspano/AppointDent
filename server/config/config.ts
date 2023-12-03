import cors from 'cors';
import morgan from 'morgan';
import express, { type Express, type Request } from 'express';
import queueMiddleware from 'express-queue';

const app: Express = express();

app.use(queueMiddleware({ maxQueue: -1, activeLimit: 6 }));
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

export default app;
