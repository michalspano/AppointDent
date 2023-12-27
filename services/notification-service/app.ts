import { config } from 'dotenv';
import database from './db/config';
import { app, port } from './config/config';
import { mqttClient } from './mqtt/mqtt';
import { basename, dirname } from 'path';
import { router } from './routes/router';

const SERVICES_PATH: string = basename(dirname(__dirname));
void mqttClient.setup(SERVICES_PATH);

config();

app.use('/', router);
app.get('/', (req, res) => {
  res.sendStatus(200);
});
app.listen(port, () => {
  console.log(((database?.open) ?? false) ? 'OK' : 'ERROR');
});
