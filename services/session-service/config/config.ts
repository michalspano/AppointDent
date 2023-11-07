import express, { type Express } from 'express';

const app: Express = express();
const port: string = process.env.PORT ?? '3001';

export { app, port };