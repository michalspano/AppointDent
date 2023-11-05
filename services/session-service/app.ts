import { config } from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';
import sequelize from './db/config';

config();

const app: Express = express();
const port: string = process.env.PORT ?? '3001';

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from: AppointDent - Session Service');
});

sequelize.authenticate().then(() => {
  console.log(`Connected to database ${sequelize.config.database}` +
              ` as ${sequelize.config.username} on port ${sequelize.config.port}`);
}).catch((error: Error) => {
  // Handle the error appropriately; the server should not start if it cannot connect to the database.
  console.error('Unable to connect to the database:', error);
});

app.listen(port, () => {
  console.log('AppointDent - Sessions Service');
  console.log(`Server is running at http://localhost:${port}`);
});