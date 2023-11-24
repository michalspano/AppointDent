import express, { type Express } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { authoriseUser } from '../middlewares/authorisation';

const app: Express = express();

app.use(morgan('dev'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/:id', authoriseUser);
app.use('/:email', authoriseUser);

const port: string = process.env.PORT ?? '3004';

export { app, port };
