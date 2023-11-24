import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app: Express = express();
app.use(morgan('dev')); // Add morgan HTTP request logger.
app.use(express.json()); // for parsing application/json
app.use(cookieParser()); // Add cookie parser.
app.use(express.urlencoded({ extended: true }));

const port: string = process.env.PORT ?? '3003';

export { app, port };
