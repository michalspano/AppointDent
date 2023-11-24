import express, { type Express, type Request } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authoriseUser } from '../middlewares/authorisation';

const app: Express = express();
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
app.use(express.json()); // for parsing application/json
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/:id', authoriseUser);
app.use('/:email', authoriseUser);

const port: string = process.env.PORT ?? '3004';

export { app, port };
