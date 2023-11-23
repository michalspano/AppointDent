import cors from 'cors';
import morgan from 'morgan';
import express, { type Express } from 'express';

const app: Express = express();

app.use(morgan('dev')); // Add morgan HTTP request logger.

// Enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());

export default app;
