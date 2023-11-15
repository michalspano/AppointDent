import { config } from 'dotenv';
import router from './routes';
import database from './db/config';
import { app, port } from './config/config';
import { mqttClient } from './mqtt/mqtt';
import { basename, dirname } from 'path';

const SERVICES_PATH: string = basename(dirname(__dirname));
void mqttClient.setup(SERVICES_PATH);

config();

// Use the routes defined in routes/index.ts.
app.use('/api', router);

// TODO: add mechanism to add undefined routes. 

app.listen(port, () => {
  console.log('AppointDent - Appointments Service');
  console.log(`Server is running at http://localhost:${port}/api`);
  console.log(`Using database: ${database?.name}`);
  console.log(`Database connection: ${((database?.open) ?? false) ? 'OK' : 'ERROR'}`);
});
